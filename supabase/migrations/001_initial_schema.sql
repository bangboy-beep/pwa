-- =============================================
-- SmartQR — Core Multi-Tenant Schema (Hardened)
-- Migration: 001_initial_schema.sql
-- =============================================

-- Enable uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TYPE ENUMS
-- =============================================

CREATE TYPE public.business_type_enum AS ENUM (
  'restaurant',
  'cafe',
  'hotel',
  'homestay',
  'villa',
  'bar',
  'salon',
  'barbershop',
  'other'
);

CREATE TYPE public.business_status_enum AS ENUM (
  'active',
  'inactive',
  'suspended'
);

CREATE TYPE public.user_role_enum AS ENUM (
  'owner',
  'admin',
  'staff'
);

-- =============================================
-- TABLE: businesses
-- =============================================

CREATE TABLE IF NOT EXISTS public.businesses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  business_type   public.business_type_enum NOT NULL,
  logo_url        TEXT,
  cover_url       TEXT,
  description     TEXT,
  address         TEXT,
  phone           TEXT,
  whatsapp        TEXT,
  google_maps_url TEXT,
  google_review_url TEXT,
  instagram_url   TEXT,
  facebook_url    TEXT,
  tiktok_url      TEXT,
  website_url     TEXT,
  opening_hours   JSONB,
  theme           JSONB,
  status          public.business_status_enum NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_businesses_slug ON public.businesses (slug);
CREATE INDEX idx_businesses_status ON public.businesses (status);

-- =============================================
-- TABLE: business_members
-- =============================================

CREATE TABLE IF NOT EXISTS public.business_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.user_role_enum NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_business_member UNIQUE (business_id, user_id)
);

CREATE INDEX idx_members_business ON public.business_members (business_id);
CREATE INDEX idx_members_user ON public.business_members (user_id);

-- =============================================
-- SECURITY DEFINER HELPER FUNCTIONS (Hardened search_path)
-- =============================================

-- Returns true if the currently authenticated user is a member of the given business.
CREATE OR REPLACE FUNCTION public.is_business_member(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = p_business_id
      AND user_id = auth.uid()
  )
$$;

-- Returns the role of the current user in the given business (NULL if not a member).
CREATE OR REPLACE FUNCTION public.get_business_role(p_business_id UUID)
RETURNS public.user_role_enum
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.business_members
  WHERE business_id = p_business_id
    AND user_id = auth.uid()
  LIMIT 1
$$;

-- Restrict execute privileges on helper functions
REVOKE EXECUTE ON FUNCTION public.is_business_member(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_business_role(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_business_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_business_role(UUID) TO authenticated;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: businesses
-- =============================================

CREATE POLICY "Members can read their business"
  ON public.businesses
  FOR SELECT
  TO authenticated
  USING (
    public.is_business_member(id)
  );

CREATE POLICY "Public can read active businesses"
  ON public.businesses
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Owners and admins can update business"
  ON public.businesses
  FOR UPDATE
  TO authenticated
  USING (
    public.get_business_role(id) IN ('owner', 'admin')
  )
  WITH CHECK (
    public.get_business_role(id) IN ('owner', 'admin')
  );

-- Authenticated users can insert businesses during onboarding/creation.
-- Security property: The subsequent AFTER INSERT trigger handle_new_business_owner()
-- automatically binds auth.uid() as the sole 'owner' in business_members,
-- ensuring every new business is immediately isolated and owned by its creator.
CREATE POLICY "Authenticated users can create businesses"
  ON public.businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- RLS POLICIES: business_members
-- =============================================

CREATE POLICY "Members can view memberships"
  ON public.business_members
  FOR SELECT
  TO authenticated
  USING (
    public.is_business_member(business_id)
  );

-- Fixed: evaluated via proposed row column name `business_id` instead of `NEW.business_id`
CREATE POLICY "Only owners can add members"
  ON public.business_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_business_role(business_id) = 'owner'
  );

CREATE POLICY "Only owners can update roles"
  ON public.business_members
  FOR UPDATE
  TO authenticated
  USING (
    public.get_business_role(business_id) = 'owner'
  )
  WITH CHECK (
    public.get_business_role(business_id) = 'owner'
  );

CREATE POLICY "Only owners can remove members"
  ON public.business_members
  FOR DELETE
  TO authenticated
  USING (
    public.get_business_role(business_id) = 'owner'
  );

-- =============================================
-- TRIGGERS & TRIGGER FUNCTIONS (Hardened search_path)
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_business_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'owner');
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_business_owner() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_business_owner() TO authenticated;

CREATE TRIGGER on_business_created
  AFTER INSERT ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_business_owner();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_businesses
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_members
  BEFORE UPDATE ON public.business_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

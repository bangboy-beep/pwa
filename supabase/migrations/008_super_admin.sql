-- =============================================
-- SmartQR — Super Admin Table
-- Migration: 008_super_admin.sql
-- =============================================

-- =============================================
-- TABLE: super_admins
-- =============================================

CREATE TABLE IF NOT EXISTS public.super_admins (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT NOT NULL UNIQUE,
  name       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.super_admins IS 'List of email addresses with super-admin privileges across all businesses.';

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Super admins can read their own entries (for management UI)
CREATE POLICY "Super admins can view super_admins"
  ON public.super_admins
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert (managed via Supabase SQL or admin panel)
CREATE POLICY "Super admins can insert super_admins"
  ON public.super_admins
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- HELPER FUNCTION: is_super_admin(email)
-- Returns true if the given email is in super_admins.
-- Used by RLS policies on sensitive tables.
-- =============================================

CREATE OR REPLACE FUNCTION public.is_super_admin(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins
    WHERE email = LOWER(p_email)
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_super_admin(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin(TEXT) TO authenticated;

-- =============================================
-- RLS POLICY: Allow super admins to read ALL businesses
-- (bypass the business_member check)
-- =============================================

DROP POLICY IF EXISTS "Members can read their business" ON public.businesses;
DROP POLICY IF EXISTS "Super admins can read all businesses" ON public.businesses;

CREATE POLICY "Super admins can read all businesses"
  ON public.businesses
  FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin(auth.email())
    OR public.is_business_member(id)
  );

-- =============================================
-- RLS POLICY: Allow super admins to delete businesses
-- =============================================

DROP POLICY IF EXISTS "Super admins can delete businesses" ON public.businesses;

CREATE POLICY "Super admins can delete businesses"
  ON public.businesses
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin(auth.email()));

-- =============================================
-- SEED: Add default super admin
-- Replace with your actual email address
-- =============================================

INSERT INTO public.super_admins (email, name)
VALUES ('rwinjember@gmail.com', 'Super Admin')
ON CONFLICT (email) DO NOTHING;

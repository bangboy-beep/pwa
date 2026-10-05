-- =============================================
-- SmartQR — Menu Categories & Menu Products Schema
-- Migration: 002_menu_schema.sql
-- =============================================

-- =============================================
-- TABLE: menu_categories
-- =============================================

CREATE TABLE IF NOT EXISTS public.menu_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_menu_categories_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Compound unique key on menu_categories for composite FK referencing
ALTER TABLE public.menu_categories
  ADD CONSTRAINT uq_menu_categories_id_business UNIQUE (id, business_id);

CREATE INDEX idx_menu_categories_business ON public.menu_categories (business_id);
CREATE INDEX idx_menu_categories_business_sort ON public.menu_categories (business_id, sort_order);
CREATE INDEX idx_menu_categories_business_active ON public.menu_categories (business_id, is_active);

-- =============================================
-- TABLE: menu_products
-- =============================================

CREATE TABLE IF NOT EXISTS public.menu_products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(12,2) NOT NULL DEFAULT 0,
  image_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_menu_products_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT chk_menu_products_price_non_negative CHECK (price >= 0),

  -- Composite Foreign Key: Enforces that category_id must belong to the exact same business_id.
  -- Prevents assigning a product in Business A to a category in Business B.
  CONSTRAINT fk_menu_products_category_business
    FOREIGN KEY (category_id, business_id)
    REFERENCES public.menu_categories (id, business_id)
    ON DELETE CASCADE
);

CREATE INDEX idx_menu_products_business ON public.menu_products (business_id);
CREATE INDEX idx_menu_products_category ON public.menu_products (category_id);
CREATE INDEX idx_menu_products_business_category_sort ON public.menu_products (business_id, category_id, sort_order);
CREATE INDEX idx_menu_products_business_active ON public.menu_products (business_id, is_active);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_products ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: menu_categories
-- =============================================

-- Public / Anonymous & Authenticated Read:
-- Only active categories belonging to active businesses
CREATE POLICY "Public can read active categories of active businesses"
  ON public.menu_categories
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = menu_categories.business_id
        AND status = 'active'
    )
  );

-- Authenticated Member Read:
-- Members (owner, admin, staff) can read all categories of their own business (active or inactive)
CREATE POLICY "Members can read own business categories"
  ON public.menu_categories
  FOR SELECT
  TO authenticated
  USING (
    public.is_business_member(business_id)
  );

-- Owner / Admin Write (Insert, Update, Delete):
CREATE POLICY "Owners and admins can insert categories"
  ON public.menu_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_business_role(business_id) IN ('owner', 'admin')
  );

CREATE POLICY "Owners and admins can update categories"
  ON public.menu_categories
  FOR UPDATE
  TO authenticated
  USING (
    public.get_business_role(business_id) IN ('owner', 'admin')
  )
  WITH CHECK (
    public.get_business_role(business_id) IN ('owner', 'admin')
  );

CREATE POLICY "Owners and admins can delete categories"
  ON public.menu_categories
  FOR DELETE
  TO authenticated
  USING (
    public.get_business_role(business_id) IN ('owner', 'admin')
  );

-- =============================================
-- RLS POLICIES: menu_products
-- =============================================

-- Public / Anonymous & Authenticated Read:
-- Only active products belonging to active category and active business
CREATE POLICY "Public can read active products of active categories and businesses"
  ON public.menu_products
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.menu_categories c
      JOIN public.businesses b ON b.id = c.business_id
      WHERE c.id = menu_products.category_id
        AND c.is_active = true
        AND b.status = 'active'
    )
  );

-- Authenticated Member Read:
-- Members (owner, admin, staff) can read all products of their own business
CREATE POLICY "Members can read own business products"
  ON public.menu_products
  FOR SELECT
  TO authenticated
  USING (
    public.is_business_member(business_id)
  );

-- Owner / Admin Write (Insert, Update, Delete):
CREATE POLICY "Owners and admins can insert products"
  ON public.menu_products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_business_role(business_id) IN ('owner', 'admin')
  );

CREATE POLICY "Owners and admins can update products"
  ON public.menu_products
  FOR UPDATE
  TO authenticated
  USING (
    public.get_business_role(business_id) IN ('owner', 'admin')
  )
  WITH CHECK (
    public.get_business_role(business_id) IN ('owner', 'admin')
  );

CREATE POLICY "Owners and admins can delete products"
  ON public.menu_products
  FOR DELETE
  TO authenticated
  USING (
    public.get_business_role(business_id) IN ('owner', 'admin')
  );

-- =============================================
-- TRIGGERS: handle_updated_at
-- =============================================

CREATE TRIGGER set_updated_at_menu_categories
  BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_menu_products
  BEFORE UPDATE ON public.menu_products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

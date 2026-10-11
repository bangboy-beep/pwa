-- =============================================
-- SmartQR — Business Admin PINs Storage & Management
-- Migration: 011_business_pins.sql
-- =============================================

-- 1. Create table for storing business owner PINs
CREATE TABLE IF NOT EXISTS public.business_pins (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
  pin         TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_pins_biz ON public.business_pins (business_id);

-- Enable Row Level Security
ALTER TABLE public.business_pins ENABLE ROW LEVEL SECURITY;

-- 2. RLS: Only Super Admins can SELECT, INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "Super admins can manage business_pins" ON public.business_pins;
CREATE POLICY "Super admins can manage business_pins"
  ON public.business_pins
  FOR ALL
  TO authenticated
  USING (
    public.is_super_admin(auth.email())
  )
  WITH CHECK (
    public.is_super_admin(auth.email())
  );

-- 3. Stored Procedure: set_business_pin
-- Safely sets/resets the business PIN and synchronizes with auth.users password
CREATE OR REPLACE FUNCTION public.set_business_pin(p_business_id UUID, p_new_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_slug TEXT;
  v_email TEXT;
BEGIN
  -- Security check: caller must be a registered super admin
  IF NOT public.is_super_admin(auth.email()) THEN
    RAISE EXCEPTION 'Access denied: Super Admin privileges required';
  END IF;

  -- Verify business exists and obtain slug
  SELECT slug INTO v_slug FROM public.businesses WHERE id = p_business_id;
  IF v_slug IS NULL THEN
    RAISE EXCEPTION 'Bisnis tidak ditemukan';
  END IF;

  v_email := v_slug || '@smartqr.app';

  -- 1. Upsert into public.business_pins
  INSERT INTO public.business_pins (business_id, pin, updated_at)
  VALUES (p_business_id, p_new_pin, NOW())
  ON CONFLICT (business_id)
  DO UPDATE SET pin = EXCLUDED.pin, updated_at = NOW();

  -- 2. Synchronize encrypted_password in auth.users if account exists
  UPDATE auth.users
  SET encrypted_password = extensions.crypt(p_new_pin, extensions.gen_salt('bf')),
      updated_at = NOW()
  WHERE email = v_email;

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_business_pin(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_business_pin(UUID, TEXT) TO authenticated;

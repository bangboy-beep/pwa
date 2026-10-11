-- =============================================
-- SmartQR — Fix set_business_pin RPC
-- Allow insert super_admins from service role (SQL Editor)
-- and fix the RPC to also accept hardcoded admin emails
-- Migration: 013_fix_set_business_pin_rpc.sql
-- =============================================

-- 1. Drop restrictive INSERT policy, allow service role (SQL Editor) to insert
DROP POLICY IF EXISTS "Super admins can insert super_admins" ON public.super_admins;
CREATE POLICY "Super admins can insert super_admins"
  ON public.super_admins
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 2. Fix is_super_admin to also check hardcoded fallback list
-- This ensures 4bangboy9999@gmail.com works even without a row in super_admins
CREATE OR REPLACE FUNCTION public.is_super_admin(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (
    LOWER(p_email) IN ('rwinjember@gmail.com', '4bangboy9999@gmail.com')
    OR EXISTS (
      SELECT 1 FROM public.super_admins
      WHERE email = LOWER(p_email)
    )
  )
$$;

-- 3. Also update set_business_pin to use same fallback approach
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
  -- Security check: caller must be a registered super admin (DB or hardcoded)
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

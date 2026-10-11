-- =============================================
-- SmartQR — Fix set_business_pin: Create auth user if not exists
-- Migration: 014_fix_set_business_pin_create_user.sql
-- =============================================

CREATE OR REPLACE FUNCTION public.set_business_pin(p_business_id UUID, p_new_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_slug TEXT;
  v_email TEXT;
  v_user_id UUID;
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

  -- 2. Check if auth user exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    -- 2a. Create auth user if not exists
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      v_email,
      extensions.crypt(p_new_pin, extensions.gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false,
      '',
      '',
      '',
      ''
    );
  ELSE
    -- 2b. Update password if user exists
    UPDATE auth.users
    SET encrypted_password = extensions.crypt(p_new_pin, extensions.gen_salt('bf')),
        updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_business_pin(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_business_pin(UUID, TEXT) TO authenticated;

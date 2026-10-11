-- =============================================
-- SmartQR — Resync all business PINs to auth.users passwords
-- Also add verify_business_pin RPC for frontend fallback
-- Migration: 015_verify_pin_rpc.sql
-- =============================================

-- RPC: verify_business_pin
-- Returns TRUE if the provided PIN matches the stored PIN for the business slug
-- Can be called by anon/authenticated to verify PIN without exposing plain text
CREATE OR REPLACE FUNCTION public.verify_business_pin(p_slug TEXT, p_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stored_pin TEXT;
  v_business_id UUID;
BEGIN
  -- Lookup business by slug
  SELECT id INTO v_business_id
  FROM public.businesses
  WHERE slug = p_slug
  LIMIT 1;

  IF v_business_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get stored PIN for that business
  SELECT pin INTO v_stored_pin
  FROM public.business_pins
  WHERE business_id = v_business_id
  LIMIT 1;

  IF v_stored_pin IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Compare PIN (plain text comparison)
  RETURN v_stored_pin = p_pin;
END;
$$;

-- Grant to anon and authenticated
GRANT EXECUTE ON FUNCTION public.verify_business_pin(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_business_pin(TEXT, TEXT) TO authenticated;


-- RPC: resync_business_pin
-- Super Admin only: re-sync a business's stored PIN to auth.users password
-- Useful when auth.users password gets out of sync with business_pins
CREATE OR REPLACE FUNCTION public.resync_business_pin(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_slug TEXT;
  v_email TEXT;
  v_pin TEXT;
  v_user_id UUID;
BEGIN
  -- Security check
  IF NOT public.is_super_admin(auth.email()) THEN
    RAISE EXCEPTION 'Access denied: Super Admin privileges required';
  END IF;

  SELECT b.slug, bp.pin
  INTO v_slug, v_pin
  FROM public.businesses b
  JOIN public.business_pins bp ON bp.business_id = b.id
  WHERE b.id = p_business_id;

  IF v_slug IS NULL OR v_pin IS NULL THEN
    RETURN FALSE;
  END IF;

  v_email := v_slug || '@smartqr.app';

  -- Check if auth user exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    -- Create auth user
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, confirmation_token,
      recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated', 'authenticated',
      v_email,
      extensions.crypt(v_pin, extensions.gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false, '', '', '', ''
    );
  ELSE
    -- Update password
    UPDATE auth.users
    SET encrypted_password = extensions.crypt(v_pin, extensions.gen_salt('bf')),
        updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.resync_business_pin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resync_business_pin(UUID) TO authenticated;


-- RPC: resync_all_business_pins
-- Super Admin: batch resync all business PINs to auth.users
CREATE OR REPLACE FUNCTION public.resync_all_business_pins()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_record RECORD;
  v_email TEXT;
  v_user_id UUID;
  v_count INTEGER := 0;
BEGIN
  IF NOT public.is_super_admin(auth.email()) THEN
    RAISE EXCEPTION 'Access denied: Super Admin privileges required';
  END IF;

  FOR v_record IN
    SELECT b.slug, bp.pin, b.id as business_id
    FROM public.businesses b
    JOIN public.business_pins bp ON bp.business_id = b.id
  LOOP
    v_email := v_record.slug || '@smartqr.app';

    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

    IF v_user_id IS NULL THEN
      INSERT INTO auth.users (
        instance_id, id, aud, role, email,
        encrypted_password, email_confirmed_at,
        created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        is_super_admin, confirmation_token,
        recovery_token, email_change_token_new, email_change
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated', 'authenticated',
        v_email,
        extensions.crypt(v_record.pin, extensions.gen_salt('bf')),
        NOW(), NOW(), NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        false, '', '', '', ''
      );
    ELSE
      UPDATE auth.users
      SET encrypted_password = extensions.crypt(v_record.pin, extensions.gen_salt('bf')),
          updated_at = NOW()
      WHERE id = v_user_id;
    END IF;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.resync_all_business_pins() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resync_all_business_pins() TO authenticated;

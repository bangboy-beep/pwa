-- =============================================
-- SmartQR — Resync all business PINs to auth.users passwords
-- Also add verify_business_pin RPC for frontend fallback
-- Migration: 015_verify_pin_rpc.sql
-- =============================================

-- RPC: verify_business_pin
-- Returns TRUE if the provided PIN matches the stored PIN for the business slug
-- When matched, automatically ensures auth.users, auth.identities, and business_members
-- are synchronized so the user can immediately log in with signInWithPassword.
CREATE OR REPLACE FUNCTION public.verify_business_pin(p_slug TEXT, p_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_stored_pin TEXT;
  v_business_id UUID;
  v_email TEXT;
  v_user_id UUID;
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

  IF v_stored_pin IS NULL OR v_stored_pin != p_pin THEN
    RETURN FALSE;
  END IF;

  -- PIN is valid! Auto-sync auth.users & auth.identities so Supabase Auth accepts login
  v_email := p_slug || '@smartqr.app';

  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, confirmation_token,
      recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated', 'authenticated',
      v_email,
      extensions.crypt(p_pin, extensions.gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false, '', '', '', ''
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = extensions.crypt(p_pin, extensions.gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW(),
        raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb
    WHERE id = v_user_id;
  END IF;

  -- Ensure identity exists in auth.identities
  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_user_id) THEN
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_user_id::text,
      v_user_id,
      json_build_object('sub', v_user_id::text, 'email', v_email)::jsonb,
      'email',
      v_email,
      NOW(), NOW(), NOW()
    );
  END IF;

  -- Ensure user is linked as owner in business_members
  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (v_business_id, v_user_id, 'owner')
  ON CONFLICT (business_id, user_id) DO UPDATE SET role = 'owner';

  RETURN TRUE;
END;
$$;

-- Grant to anon and authenticated
GRANT EXECUTE ON FUNCTION public.verify_business_pin(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_business_pin(TEXT, TEXT) TO authenticated;


-- RPC: resync_business_pin
-- Super Admin only: re-sync a business's stored PIN to auth.users password & identities
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

  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, confirmation_token,
      recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated', 'authenticated',
      v_email,
      extensions.crypt(v_pin, extensions.gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false, '', '', '', ''
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = extensions.crypt(v_pin, extensions.gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW(),
        raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb
    WHERE id = v_user_id;
  END IF;

  -- Ensure identity exists in auth.identities
  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_user_id) THEN
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_user_id::text,
      v_user_id,
      json_build_object('sub', v_user_id::text, 'email', v_email)::jsonb,
      'email',
      v_email,
      NOW(), NOW(), NOW()
    );
  END IF;

  -- Ensure member link exists in business_members
  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (p_business_id, v_user_id, 'owner')
  ON CONFLICT (business_id, user_id) DO UPDATE SET role = 'owner';

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.resync_business_pin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resync_business_pin(UUID) TO authenticated;


-- RPC: resync_all_business_pins
-- Super Admin: batch resync all business PINs to auth.users & identities
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

    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;

    IF v_user_id IS NULL THEN
      v_user_id := gen_random_uuid();
      INSERT INTO auth.users (
        instance_id, id, aud, role, email,
        encrypted_password, email_confirmed_at,
        created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        is_super_admin, confirmation_token,
        recovery_token, email_change_token_new, email_change
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
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
          email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
          updated_at = NOW(),
          raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb
      WHERE id = v_user_id;
    END IF;

    -- Ensure identity exists in auth.identities
    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_user_id) THEN
      INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
      ) VALUES (
        v_user_id::text,
        v_user_id,
        json_build_object('sub', v_user_id::text, 'email', v_email)::jsonb,
        'email',
        v_email,
        NOW(), NOW(), NOW()
      );
    END IF;

    -- Ensure member link exists in business_members
    INSERT INTO public.business_members (business_id, user_id, role)
    VALUES (v_record.business_id, v_user_id, 'owner')
    ON CONFLICT (business_id, user_id) DO UPDATE SET role = 'owner';

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.resync_all_business_pins() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resync_all_business_pins() TO authenticated;


-- RPC: ensure_my_business_membership
-- Dipanggil saat login untuk memastikan user dengan email <slug>@smartqr.app
-- terdaftar sebagai 'owner' di tabel business_members
CREATE OR REPLACE FUNCTION public.ensure_my_business_membership()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_email TEXT;
  v_slug TEXT;
  v_business_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  v_email := auth.email();

  IF v_user_id IS NULL OR v_email IS NULL THEN
    RETURN NULL;
  END IF;

  IF v_email LIKE '%@smartqr.app' THEN
    v_slug := replace(v_email, '@smartqr.app', '');

    SELECT id INTO v_business_id
    FROM public.businesses
    WHERE slug = v_slug
    LIMIT 1;

    IF v_business_id IS NOT NULL THEN
      INSERT INTO public.business_members (business_id, user_id, role)
      VALUES (v_business_id, v_user_id, 'owner')
      ON CONFLICT (business_id, user_id) DO UPDATE SET role = 'owner';

      RETURN v_business_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.ensure_my_business_membership() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_my_business_membership() TO authenticated;


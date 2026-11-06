-- =============================================
-- SmartQR Migration 022
-- Fix: set_business_pin missing auth.identities insert
-- Fix: add loose slug lookup RPC for login (tolerates missing hyphens)
-- Fix: auth.identities.id is UUID (not text) in newer Supabase versions
--      → patch verify_business_pin, resync_business_pin, resync_all_business_pins
-- =============================================

-- 1. Fix set_business_pin to also upsert auth.identities
-- (Without an identity record, signInWithPassword always fails even if auth.users exists)
CREATE OR REPLACE FUNCTION public.set_business_pin(p_business_id UUID, p_new_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_slug    TEXT;
  v_email   TEXT;
  v_user_id UUID;
BEGIN
  -- Security: only super admins may change PINs
  IF NOT public.is_super_admin(auth.email()) THEN
    RAISE EXCEPTION 'Access denied: Super Admin privileges required';
  END IF;

  -- Resolve slug
  SELECT slug INTO v_slug FROM public.businesses WHERE id = p_business_id;
  IF v_slug IS NULL THEN
    RAISE EXCEPTION 'Bisnis tidak ditemukan';
  END IF;

  v_email := v_slug || '@smartqr.app';

  -- 1. Upsert PIN in business_pins table
  INSERT INTO public.business_pins (business_id, pin, updated_at)
  VALUES (p_business_id, p_new_pin, NOW())
  ON CONFLICT (business_id)
  DO UPDATE SET pin = EXCLUDED.pin, updated_at = NOW();

  -- 2. Create or update auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

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
      extensions.crypt(p_new_pin, extensions.gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false, '', '', '', ''
    );
  ELSE
    -- Update password AND make sure email is confirmed
    UPDATE auth.users
    SET encrypted_password    = extensions.crypt(p_new_pin, extensions.gen_salt('bf')),
        email_confirmed_at    = COALESCE(email_confirmed_at, NOW()),
        updated_at            = NOW(),
        raw_app_meta_data     = '{"provider":"email","providers":["email"]}'::jsonb
    WHERE id = v_user_id;
  END IF;

  -- 3. Ensure auth.identities exists (THIS WAS THE MISSING PIECE)
  --    Without this, signInWithPassword always fails even with correct password.
  --    NOTE: auth.identities.id is UUID in newer Supabase versions, not text.
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_user_id,
    v_user_id,
    json_build_object('sub', v_user_id::text, 'email', v_email)::jsonb,
    'email',
    v_email,
    NOW(), NOW(), NOW()
  )
  ON CONFLICT (provider, provider_id) DO UPDATE
    SET identity_data = EXCLUDED.identity_data,
        updated_at    = NOW();

  -- 4. Ensure business_members link
  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (p_business_id, v_user_id, 'owner')
  ON CONFLICT (business_id, user_id) DO UPDATE SET role = 'owner';

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_business_pin(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_business_pin(UUID, TEXT) TO authenticated;


-- =============================================
-- 1b. Patch verify_business_pin (from migration 015)
--     Fix auth.identities.id to use UUID, not text::cast
-- =============================================
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
  SELECT id INTO v_business_id
  FROM public.businesses
  WHERE slug = p_slug
  LIMIT 1;

  IF v_business_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT pin INTO v_stored_pin
  FROM public.business_pins
  WHERE business_id = v_business_id
  LIMIT 1;

  IF v_stored_pin IS NULL OR v_stored_pin != p_pin THEN
    RETURN FALSE;
  END IF;

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

  -- id column is UUID in newer Supabase (was text before)
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_user_id,
    v_user_id,
    json_build_object('sub', v_user_id::text, 'email', v_email)::jsonb,
    'email',
    v_email,
    NOW(), NOW(), NOW()
  )
  ON CONFLICT (provider, provider_id) DO UPDATE
    SET identity_data = EXCLUDED.identity_data,
        updated_at    = NOW();

  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (v_business_id, v_user_id, 'owner')
  ON CONFLICT (business_id, user_id) DO UPDATE SET role = 'owner';

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_business_pin(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_business_pin(TEXT, TEXT) TO authenticated;


-- =============================================
-- 2. New RPC: lookup_business_for_login
-- Callable by anon. Accepts "loose" slug input (with or without hyphens).
-- Returns the canonical slug and business id/name so the frontend can
-- use the EXACT slug for the auth email (slug@smartqr.app).
-- Matching order:
--   a) exact slug match
--   b) slug with hyphens stripped on both sides (e.g. "restolezatoz" → "resto-lezatoz")
--   c) phonetic s/z interchange (e.g. "restolezatos" → "resto-lezatoz")
--   d) stripped business name match (e.g. "resto lezatoz" → "resto-lezatoz")
-- =============================================
CREATE OR REPLACE FUNCTION public.lookup_business_for_login(p_input TEXT)
RETURNS TABLE(
  business_id   UUID,
  business_name TEXT,
  slug          TEXT,
  status        TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized    TEXT;
  v_sz_normalized TEXT;
BEGIN
  -- Normalise input: lowercase, keep only a-z 0-9 and hyphens
  p_input         := lower(trim(p_input));
  p_input         := regexp_replace(p_input, '[^a-z0-9\-]', '', 'g');
  v_normalized    := replace(p_input, '-', ''); -- strip hyphens for fuzzy compare
  v_sz_normalized := replace(v_normalized, 'z', 's'); -- normalise s/z variations

  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.slug,
    b.status::TEXT
  FROM public.businesses b
  WHERE
    -- a) exact match
    b.slug = p_input
    OR
    -- b) input (stripped) = stored slug (stripped)
    replace(b.slug, '-', '') = v_normalized
    OR
    -- c) phonetic s/z interchange (handles user typing "restolezatos" when DB has "resto-lezatoz")
    replace(replace(b.slug, '-', ''), 'z', 's') = v_sz_normalized
    OR
    -- d) input = business name without spaces
    replace(replace(lower(regexp_replace(b.name, '[^a-zA-Z0-9]', '', 'g')), 'z', 's'), '-', '') = v_sz_normalized
  ORDER BY
    -- prefer exact match, then stripped match, then s/z match
    CASE
      WHEN b.slug = p_input THEN 0
      WHEN replace(b.slug, '-', '') = v_normalized THEN 1
      WHEN replace(replace(b.slug, '-', ''), 'z', 's') = v_sz_normalized THEN 2
      ELSE 3
    END,
    b.created_at DESC
  LIMIT 1;
END;
$$;

-- Allow anon to call this (needed for pre-login slug check)
GRANT EXECUTE ON FUNCTION public.lookup_business_for_login(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.lookup_business_for_login(TEXT) TO authenticated;


-- =============================================
-- 3. Run a one-time resync to fix any existing businesses
--    whose auth.identities may be missing.
-- =============================================
DO $$
DECLARE
  v_record  RECORD;
  v_email   TEXT;
  v_user_id UUID;
BEGIN
  FOR v_record IN
    SELECT b.slug, bp.pin, b.id AS business_id
    FROM   public.businesses b
    JOIN   public.business_pins bp ON bp.business_id = b.id
  LOOP
    v_email := v_record.slug || '@smartqr.app';

    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

    -- Create user if missing
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
      -- Ensure confirmed
      UPDATE auth.users
      SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
          updated_at         = NOW()
      WHERE id = v_user_id;
    END IF;

    -- Ensure identity
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_user_id,
      v_user_id,
      json_build_object('sub', v_user_id::text, 'email', v_email)::jsonb,
      'email',
      v_email,
      NOW(), NOW(), NOW()
    )
    ON CONFLICT (provider, provider_id) DO UPDATE
      SET identity_data = EXCLUDED.identity_data,
          updated_at    = NOW();

    -- Ensure membership
    INSERT INTO public.business_members (business_id, user_id, role)
    VALUES (v_record.business_id, v_user_id, 'owner')
    ON CONFLICT (business_id, user_id) DO UPDATE SET role = 'owner';

  END LOOP;
END;
$$;


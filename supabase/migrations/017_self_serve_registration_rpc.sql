-- =============================================
-- SmartQR — Self-Serve Business Registration RPC & Trigger Fix
-- Migration: 017_self_serve_registration_rpc.sql
-- =============================================

-- 1. FIX TRIGGER: handle_new_business_owner
-- Ensure it only inserts to business_members when auth.uid() is not null.
-- Previously it failed with null constraint when called during anonymous self-registration!
CREATE OR REPLACE FUNCTION public.handle_new_business_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.business_members (business_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'owner')
    ON CONFLICT (business_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.handle_new_business_owner() TO anon, authenticated;

-- 2. CREATE RPC: register_business_self_serve
CREATE OR REPLACE FUNCTION public.register_business_self_serve(
  p_name TEXT,
  p_slug TEXT,
  p_business_type TEXT,
  p_whatsapp TEXT DEFAULT NULL,
  p_pin TEXT DEFAULT '123456'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_clean_slug TEXT;
  v_biz_type public.business_type_enum;
  v_biz_id UUID;
  v_trial_ends_at TIMESTAMPTZ;
  v_email TEXT;
  v_user_id UUID;
  v_res JSONB;
BEGIN
  -- 1. Sanitize slug
  v_clean_slug := lower(regexp_replace(p_slug, '[^a-zA-Z0-9-]', '', 'g'));
  v_clean_slug := regexp_replace(v_clean_slug, '-+', '-', 'g');
  v_clean_slug := trim(both '-' from v_clean_slug);

  IF v_clean_slug IS NULL OR length(v_clean_slug) < 2 THEN
    RAISE EXCEPTION 'URL / Slug tidak valid minimal 2 karakter';
  END IF;

  -- 2. Check if slug exists
  IF EXISTS (SELECT 1 FROM public.businesses WHERE slug = v_clean_slug) THEN
    RAISE EXCEPTION 'URL / Slug "%" sudah digunakan bisnis lain. Silakan pilih slug lain.', v_clean_slug;
  END IF;

  -- 3. Validate / Cast business type
  BEGIN
    v_biz_type := p_business_type::public.business_type_enum;
  EXCEPTION WHEN OTHERS THEN
    v_biz_type := 'cafe'::public.business_type_enum;
  END;

  v_trial_ends_at := NOW() + INTERVAL '14 days';
  v_email := v_clean_slug || '@smartqr.app';

  -- 4. Create user in auth.users first or get existing
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
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      'email',
      v_email,
      NOW(), NOW(), NOW()
    );
  END IF;

  -- 5. Insert business (bypasses RLS safely with SECURITY DEFINER)
  INSERT INTO public.businesses (
    name,
    slug,
    business_type,
    whatsapp,
    status,
    subscription_tier,
    trial_ends_at,
    created_at,
    updated_at
  ) VALUES (
    trim(p_name),
    v_clean_slug,
    v_biz_type,
    nullif(trim(p_whatsapp), ''),
    'active',
    'trial',
    v_trial_ends_at,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_biz_id;

  -- 6. Insert / Upsert PIN in public.business_pins
  INSERT INTO public.business_pins (business_id, pin, updated_at)
  VALUES (v_biz_id, trim(p_pin), NOW())
  ON CONFLICT (business_id) DO UPDATE SET pin = EXCLUDED.pin, updated_at = NOW();

  -- 7. Ensure owner membership in public.business_members
  INSERT INTO public.business_members (business_id, user_id, role, created_at, updated_at)
  VALUES (v_biz_id, v_user_id, 'owner', NOW(), NOW())
  ON CONFLICT (business_id, user_id) DO NOTHING;

  -- 8. Return created business json
  SELECT jsonb_build_object(
    'id', id,
    'name', name,
    'slug', slug,
    'business_type', business_type,
    'status', status,
    'trial_ends_at', trial_ends_at,
    'subscription_tier', subscription_tier
  ) INTO v_res
  FROM public.businesses
  WHERE id = v_biz_id;

  RETURN v_res;
END;
$$;

-- Grant EXECUTE permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.register_business_self_serve(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

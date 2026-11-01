-- =============================================
-- SmartQR — Complete Business Deletion RPC
-- Migration: 019_delete_business_complete_rpc.sql
-- =============================================
-- Ensures that when a super admin deletes a business,
-- ALL related data is removed including:
--   1. business_pins (CASCADE handles this, but explicit for safety)
--   2. business_members (CASCADE handles this, but explicit for safety)
--   3. menu_categories + menu_items (if they exist)
--   4. wifi_credentials (if they exist)
--   5. reviews (if they exist)
--   6. The auth.users account (<slug>@smartqr.app)
--   7. The auth.identities for that user
--   8. The business row itself
-- =============================================

CREATE OR REPLACE FUNCTION public.delete_business_complete(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
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

  -- Get the business slug
  SELECT slug INTO v_slug FROM public.businesses WHERE id = p_business_id;
  IF v_slug IS NULL THEN
    RAISE EXCEPTION 'Business not found';
  END IF;

  v_email := v_slug || '@smartqr.app';

  -- 1. Delete business_pins (also handled by CASCADE, but explicit)
  DELETE FROM public.business_pins WHERE business_id = p_business_id;

  -- 2. Delete business_members (also handled by CASCADE, but explicit)
  DELETE FROM public.business_members WHERE business_id = p_business_id;

  -- 3. Delete menu_items if table exists
  BEGIN
    EXECUTE 'DELETE FROM public.menu_items WHERE category_id IN (SELECT id FROM public.menu_categories WHERE business_id = $1)' USING p_business_id;
  EXCEPTION WHEN undefined_table THEN
    -- table doesn't exist, skip
  END;

  -- 4. Delete menu_categories if table exists
  BEGIN
    EXECUTE 'DELETE FROM public.menu_categories WHERE business_id = $1' USING p_business_id;
  EXCEPTION WHEN undefined_table THEN
    -- table doesn't exist, skip
  END;

  -- 5. Delete wifi_credentials if table exists
  BEGIN
    EXECUTE 'DELETE FROM public.wifi_credentials WHERE business_id = $1' USING p_business_id;
  EXCEPTION WHEN undefined_table THEN
    -- table doesn't exist, skip
  END;

  -- 6. Delete reviews if table exists
  BEGIN
    EXECUTE 'DELETE FROM public.reviews WHERE business_id = $1' USING p_business_id;
  EXCEPTION WHEN undefined_table THEN
    -- table doesn't exist, skip
  END;

  -- 7. Delete the business row itself
  DELETE FROM public.businesses WHERE id = p_business_id;

  -- 8. Delete the auth user (<slug>@smartqr.app) and its identities
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Delete identities first
    DELETE FROM auth.identities WHERE user_id = v_user_id;
    -- Delete sessions
    BEGIN
      DELETE FROM auth.sessions WHERE user_id = v_user_id;
    EXCEPTION WHEN undefined_table THEN
      -- skip if no sessions table
    END;
    -- Delete refresh tokens
    BEGIN
      DELETE FROM auth.refresh_tokens WHERE user_id = v_user_id;
    EXCEPTION WHEN undefined_table THEN
      -- skip
    END;
    -- Delete the auth user
    DELETE FROM auth.users WHERE id = v_user_id;
  END IF;

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_business_complete(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_business_complete(UUID) TO authenticated;

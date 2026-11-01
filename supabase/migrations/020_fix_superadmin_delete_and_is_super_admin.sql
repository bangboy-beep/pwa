-- =============================================
-- SmartQR — Fix Super Admin Delete & Permissions (Clean Public Schema)
-- Migration: 020_fix_superadmin_delete_and_is_super_admin.sql
-- =============================================

-- 1. Helper function di schema public untuk mengambil email user saat ini
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT LOWER(COALESCE(auth.jwt() ->> 'email', (SELECT email FROM auth.users WHERE id = auth.uid())));
$$;

GRANT EXECUTE ON FUNCTION public.current_user_email() TO authenticated, anon;

-- 2. Fungsi is_super_admin yang aman dan ada di public schema
CREATE OR REPLACE FUNCTION public.is_super_admin(p_email TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email TEXT;
BEGIN
  v_email := LOWER(COALESCE(p_email, public.current_user_email()));

  IF v_email IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN (
    v_email IN ('rwinjember@gmail.com', '4bangboy9999@gmail.com', '4bangboy999@gmail.com')
    OR EXISTS (
      SELECT 1 FROM public.super_admins
      WHERE LOWER(email) = v_email
    )
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_super_admin(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin(TEXT) TO authenticated, anon;

-- 3. Masukkan ke tabel super_admins
INSERT INTO public.super_admins (email, name)
VALUES 
  ('4bangboy9999@gmail.com', 'Super Admin'),
  ('4bangboy999@gmail.com', 'Super Admin'),
  ('rwinjember@gmail.com', 'Super Admin')
ON CONFLICT (email) DO NOTHING;

-- 4. RPC pembersih tuntas bisnis + relasinya
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
  v_caller_email TEXT;
BEGIN
  v_caller_email := public.current_user_email();

  -- Cek izin Super Admin
  IF NOT public.is_super_admin(v_caller_email) THEN
    RAISE EXCEPTION 'Access denied: Super Admin privileges required';
  END IF;

  -- Ambil slug bisnis
  SELECT slug INTO v_slug FROM public.businesses WHERE id = p_business_id;
  IF v_slug IS NULL THEN
    RETURN TRUE;
  END IF;

  v_email := v_slug || '@smartqr.app';

  -- Bersihkan data anak secara eksplisit
  BEGIN
    DELETE FROM public.business_pins WHERE business_id = p_business_id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    DELETE FROM public.business_members WHERE business_id = p_business_id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    EXECUTE 'DELETE FROM public.menu_items WHERE category_id IN (SELECT id FROM public.menu_categories WHERE business_id = $1)' USING p_business_id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    EXECUTE 'DELETE FROM public.menu_categories WHERE business_id = $1' USING p_business_id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    EXECUTE 'DELETE FROM public.wifi_credentials WHERE business_id = $1' USING p_business_id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    EXECUTE 'DELETE FROM public.reviews WHERE business_id = $1' USING p_business_id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Hapus data bisnis utama
  DELETE FROM public.businesses WHERE id = p_business_id;

  -- Hapus akun auth user terkait jika ada
  BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;
    IF v_user_id IS NOT NULL THEN
      DELETE FROM auth.identities WHERE user_id = v_user_id;
      DELETE FROM auth.users WHERE id = v_user_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_business_complete(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_business_complete(UUID) TO authenticated;

-- 5. Perbarui policy DELETE pada tabel businesses
DROP POLICY IF EXISTS "Super admins can delete businesses" ON public.businesses;
CREATE POLICY "Super admins can delete businesses"
  ON public.businesses
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

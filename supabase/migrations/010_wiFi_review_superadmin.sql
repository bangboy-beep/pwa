-- =============================================
-- SmartQR — Fix WiFi & Review RLS for Super Admin
-- Migration: 010_wiFi_review_superadmin.sql
-- =============================================
-- Super admin doesn't exist in business_members,
-- so RLS policies using get_business_role() block them.
-- Add is_super_admin() bypass to all write policies.

-- =============================================
-- TABLE: business_wifi_networks
-- =============================================

DROP POLICY IF EXISTS "Allow owner and admin to insert wifi networks" ON public.business_wifi_networks;
CREATE POLICY "Allow owner and admin to insert wifi networks"
  ON public.business_wifi_networks FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin(auth.email())
    OR public.get_business_role(business_id) IN ('owner', 'admin')
  );

DROP POLICY IF EXISTS "Allow owner and admin to update wifi networks" ON public.business_wifi_networks;
CREATE POLICY "Allow owner and admin to update wifi networks"
  ON public.business_wifi_networks FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin(auth.email())
    OR public.get_business_role(business_id) IN ('owner', 'admin')
  )
  WITH CHECK (
    public.is_super_admin(auth.email())
    OR public.get_business_role(business_id) IN ('owner', 'admin')
  );

DROP POLICY IF EXISTS "Allow owner and admin to delete wifi networks" ON public.business_wifi_networks;
CREATE POLICY "Allow owner and admin to delete wifi networks"
  ON public.business_wifi_networks FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin(auth.email())
    OR public.get_business_role(business_id) IN ('owner', 'admin')
  );

-- =============================================
-- TABLE: review_settings
-- =============================================

DROP POLICY IF EXISTS "Allow owner and admin to insert reviews" ON public.review_settings;
CREATE POLICY "Allow owner and admin to insert reviews"
  ON public.review_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin(auth.email())
    OR public.get_business_role(business_id) IN ('owner', 'admin')
  );

DROP POLICY IF EXISTS "Allow owner and admin to update reviews" ON public.review_settings;
CREATE POLICY "Allow owner and admin to update reviews"
  ON public.review_settings FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin(auth.email())
    OR public.get_business_role(business_id) IN ('owner', 'admin')
  )
  WITH CHECK (
    public.is_super_admin(auth.email())
    OR public.get_business_role(business_id) IN ('owner', 'admin')
  );

DROP POLICY IF EXISTS "Allow owner and admin to delete reviews" ON public.review_settings;
CREATE POLICY "Allow owner and admin to delete reviews"
  ON public.review_settings FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin(auth.email())
    OR public.get_business_role(business_id) IN ('owner', 'admin')
  );

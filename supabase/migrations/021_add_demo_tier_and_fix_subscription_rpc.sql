-- =============================================
-- SmartQR — Add Demo / Lifetime Tier & Fix update_business_subscription RPC
-- Migration: 021_add_demo_tier_and_fix_subscription_rpc.sql
-- =============================================

-- 1. Fix RPC update_business_subscription to support 'demo', 'lifetime', and fix variable scoping
CREATE OR REPLACE FUNCTION public.update_business_subscription(
  p_business_id UUID,
  p_tier TEXT,
  p_days INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_new_end TIMESTAMPTZ;
  v_res JSONB;
BEGIN
  -- If tier is demo or lifetime, remove trial expiration and set permanent lifetime subscription
  IF p_tier = 'demo' OR p_tier = 'lifetime' THEN
    UPDATE public.businesses
    SET 
      subscription_tier = 'demo',
      trial_ends_at = NULL,
      subscription_ends_at = '2099-12-31 23:59:59+00'::TIMESTAMPTZ,
      status = 'active',
      updated_at = NOW()
    WHERE id = p_business_id
    RETURNING jsonb_build_object(
      'id', id,
      'tier', subscription_tier,
      'trial_ends_at', trial_ends_at,
      'subscription_ends_at', subscription_ends_at,
      'status', status
    ) INTO v_res;

  -- If tier is trial, extend trial_ends_at
  ELSIF p_tier = 'trial' THEN
    UPDATE public.businesses
    SET 
      trial_ends_at = GREATEST(COALESCE(trial_ends_at, NOW()), NOW()) + (p_days || ' days')::INTERVAL,
      subscription_tier = 'trial',
      status = 'active',
      updated_at = NOW()
    WHERE id = p_business_id
    RETURNING jsonb_build_object(
      'id', id,
      'tier', subscription_tier,
      'trial_ends_at', trial_ends_at,
      'status', status
    ) INTO v_res;

  -- Paid subscription (monthly / yearly)
  ELSE
    SELECT GREATEST(COALESCE(subscription_ends_at, NOW()), NOW()) + (p_days || ' days')::INTERVAL
    INTO v_new_end
    FROM public.businesses
    WHERE id = p_business_id;

    UPDATE public.businesses
    SET 
      subscription_tier = p_tier,
      subscription_ends_at = v_new_end,
      status = 'active',
      updated_at = NOW()
    WHERE id = p_business_id
    RETURNING jsonb_build_object(
      'id', id,
      'tier', subscription_tier,
      'subscription_ends_at', subscription_ends_at,
      'status', status
    ) INTO v_res;
  END IF;

  RETURN v_res;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_business_subscription(UUID, TEXT, INTEGER) TO authenticated, anon;

-- 2. Explicitly set 'my-coffee' as Demo (no trial, permanent active)
UPDATE public.businesses
SET 
  subscription_tier = 'demo',
  trial_ends_at = NULL,
  subscription_ends_at = '2099-12-31 23:59:59+00'::TIMESTAMPTZ,
  status = 'active',
  updated_at = NOW()
WHERE slug = 'my-coffee';

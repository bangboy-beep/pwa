-- =============================================
-- SmartQR — Subscriptions & 14-Day Free Trial Schema
-- Migration: 016_subscriptions_and_trials.sql
-- =============================================

-- Add subscription and trial columns to businesses table if not exists
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Backfill existing businesses: set trial_ends_at if null
UPDATE public.businesses
SET trial_ends_at = created_at + INTERVAL '14 days'
WHERE trial_ends_at IS NULL;

-- Function / RPC to extend subscription or trial (for SuperAdmin or payment confirmation)
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
  -- If tier is trial, extend trial_ends_at
  IF p_tier = 'trial' THEN
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
  ELSE
    -- Paid subscription (monthly / yearly)
    v_new_end := GREATEST(COALESCE(subscription_ends_at, NOW()), NOW()) + (p_days || ' days')::INTERVAL;
    
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

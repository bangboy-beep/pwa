-- =============================================
-- SmartQR — Security Remediation Phase 1
-- Migration: 002_security_hardening.sql
--
-- Purpose: Clarify and harden business INSERT policy.
-- This migration does NOT change behavior — it replaces the
-- inline WITH CHECK (true) policy with an explicitly named,
-- well-documented policy so the security property is auditable.
-- =============================================

-- Drop the old policy so we can recreate it with clearer naming/docs.
DROP POLICY IF EXISTS "Authenticated users can create businesses" ON public.businesses;

-- Recreate the INSERT policy with the same semantics but clearer
-- documentation. The security property enforced:
--   Only authenticated users (not anon) may INSERT a new business row.
--   On insert, the AFTER INSERT trigger handle_new_business_owner()
--   automatically binds auth.uid() as the sole 'owner' in business_members,
--   ensuring every new business is immediately isolated and owned by its creator.
--   This is the intended MVP onboarding behavior and must NOT be weakened.
CREATE POLICY "create_business_as_authenticated_user"
  ON public.businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON POLICY "create_business_as_authenticated_user" ON public.businesses IS
  'Allows authenticated users to create a new business during onboarding. '
  || 'Security: the AFTER INSERT trigger handle_new_business_owner() automatically '
  || 'inserts auth.uid() as the sole owner in business_members, guaranteeing '
  || 'immediate tenant isolation and ownership. Anon users are explicitly excluded '
  || 'by the TO authenticated clause. Do NOT remove or weaken without audit review.';

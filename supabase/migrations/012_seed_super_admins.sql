-- =============================================
-- SmartQR — Seed Super Admins
-- Migration: 012_seed_super_admins.sql
-- =============================================

-- Insert both super admin emails into the super_admins table
INSERT INTO public.super_admins (email, name)
VALUES 
  ('rwinjember@gmail.com', 'Super Admin'),
  ('4bangboy9999@gmail.com', 'Super Admin 2')
ON CONFLICT (email) DO NOTHING;

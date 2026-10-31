-- Migration 018: Add 'gym' to business_type_enum
-- =========================================================================
-- CATATAN PENTING DI POSTGRESQL / SUPABASE:
-- Nilai enum baru ('gym') harus di-COMMIT terlebih dahulu sebelum bisa dipakai.
-- Jadi jalankan Step 1 dan Step 2 secara terpisah (satu per satu)!

-- ==========================================
-- STEP 1: Jalankan ini dulu, lalu klik "Run"
-- ==========================================
ALTER TYPE public.business_type_enum ADD VALUE IF NOT EXISTS 'gym';


-- ==========================================
-- STEP 2: Setelah Step 1 sukses, baru jalankan ini
-- ==========================================
-- UPDATE public.businesses
-- SET business_type = 'gym'
-- WHERE (
--   LOWER(name) LIKE '%gym%' OR 
--   LOWER(name) LIKE '%fitness%' OR 
--   LOWER(slug) LIKE '%gym%' OR 
--   LOWER(slug) LIKE '%fitness%'
-- )
-- AND business_type = 'other';

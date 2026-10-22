-- Adds the cardio prescription field consumed by the mobile app and Staff HQ.
-- Verified missing from MW Fitness / production / mwfitness on 2026-10-22.
-- Apply only after validation and approval against the shared Neon database.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS coach_prescription text;

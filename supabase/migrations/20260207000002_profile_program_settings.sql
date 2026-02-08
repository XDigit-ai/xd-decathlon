-- Migration: Add program settings to profiles
-- Description: Configurable program start date and protein target

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS program_start_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS protein_target_g INTEGER DEFAULT 150;

COMMENT ON COLUMN public.profiles.program_start_date IS 'Date the current training program started. Used to calculate current phase and week.';
COMMENT ON COLUMN public.profiles.protein_target_g IS 'Daily protein intake target in grams. Default: 150g.';

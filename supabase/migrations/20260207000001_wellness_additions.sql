-- Migration: Add elbow pain, pain notes, and protein tracking to daily_wellness
-- Description: Extends wellness check-in with pain tracking and nutrition data

ALTER TABLE public.daily_wellness
  ADD COLUMN IF NOT EXISTS elbow_pain INTEGER CHECK (elbow_pain >= 0 AND elbow_pain <= 10),
  ADD COLUMN IF NOT EXISTS pain_notes TEXT,
  ADD COLUMN IF NOT EXISTS protein_g NUMERIC(5,1) CHECK (protein_g >= 0 AND protein_g <= 500);

COMMENT ON COLUMN public.daily_wellness.elbow_pain IS 'Elbow pain level (0=none, 10=worst). Used for recovery adjustments.';
COMMENT ON COLUMN public.daily_wellness.pain_notes IS 'Free-text notes about pain location, triggers, etc.';
COMMENT ON COLUMN public.daily_wellness.protein_g IS 'Daily protein intake in grams. Target: 150g.';

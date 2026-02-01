-- Migration: VO2 Max tracking table
-- Description: Stores VO2 max measurements from various sources (lab tests, watch estimates, manual entry)

-- Create vo2_source enum for tracking measurement source
CREATE TYPE public.vo2_source AS ENUM (
    'lab_test',      -- Gold standard: metabolic cart / VO2 max test
    'watch',         -- Estimated from smartwatch (Garmin, Apple Watch, etc.)
    'whoop',         -- Estimated from Whoop (if available)
    'calculated',    -- Calculated from field tests (Cooper test, etc.)
    'manual'         -- Manual entry without specific source
);

-- Create vo2max_entries table
CREATE TABLE IF NOT EXISTS public.vo2max_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    value NUMERIC(4,1) NOT NULL CHECK (value > 0 AND value < 100),
    source public.vo2_source NOT NULL DEFAULT 'manual',
    notes TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_vo2_date UNIQUE (user_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vo2max_user_id ON public.vo2max_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_vo2max_date ON public.vo2max_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_vo2max_user_date ON public.vo2max_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_vo2max_source ON public.vo2max_entries(source);

-- Enable Row Level Security
ALTER TABLE public.vo2max_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own VO2 max entries"
    ON public.vo2max_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own VO2 max entries"
    ON public.vo2max_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own VO2 max entries"
    ON public.vo2max_entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own VO2 max entries"
    ON public.vo2max_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_vo2max_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vo2max_updated_at
    BEFORE UPDATE ON public.vo2max_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_vo2max_updated_at();

-- Add table comment
COMMENT ON TABLE public.vo2max_entries IS 'VO2 max measurements tracking cardiorespiratory fitness over time';

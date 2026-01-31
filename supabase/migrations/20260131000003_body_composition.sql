-- Migration: Body composition tracking tables
-- Description: Daily weight, body measurements, and DEXA scan data

-- Create daily_weight table
CREATE TABLE IF NOT EXISTS public.daily_weight (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0 AND weight_kg < 500),
    body_fat_pct NUMERIC(4,1) CHECK (body_fat_pct >= 0 AND body_fat_pct <= 100),
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'scale', 'whoop', 'import')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_weight_date UNIQUE (user_id, date)
);

-- Create body_measurements table
CREATE TABLE IF NOT EXISTS public.body_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    waist_cm NUMERIC(5,1) CHECK (waist_cm > 0 AND waist_cm < 300),
    hips_cm NUMERIC(5,1) CHECK (hips_cm > 0 AND hips_cm < 300),
    chest_cm NUMERIC(5,1) CHECK (chest_cm > 0 AND chest_cm < 300),
    left_arm_cm NUMERIC(4,1) CHECK (left_arm_cm > 0 AND left_arm_cm < 100),
    right_arm_cm NUMERIC(4,1) CHECK (right_arm_cm > 0 AND right_arm_cm < 100),
    left_thigh_cm NUMERIC(4,1) CHECK (left_thigh_cm > 0 AND left_thigh_cm < 150),
    right_thigh_cm NUMERIC(4,1) CHECK (right_thigh_cm > 0 AND right_thigh_cm < 150),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_measurement_date UNIQUE (user_id, date)
);

-- Create dexa_scans table
CREATE TABLE IF NOT EXISTS public.dexa_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_body_fat_pct NUMERIC(4,1) CHECK (total_body_fat_pct >= 0 AND total_body_fat_pct <= 100),
    fat_mass_kg NUMERIC(5,2) CHECK (fat_mass_kg >= 0),
    lean_mass_kg NUMERIC(5,2) CHECK (lean_mass_kg >= 0),
    bone_density NUMERIC(4,2) CHECK (bone_density >= 0),
    visceral_fat_area NUMERIC(6,2) CHECK (visceral_fat_area >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_dexa_date UNIQUE (user_id, date)
);

-- Create indexes for daily_weight
CREATE INDEX IF NOT EXISTS idx_daily_weight_user_id ON public.daily_weight(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_weight_date ON public.daily_weight(date);
CREATE INDEX IF NOT EXISTS idx_daily_weight_user_date ON public.daily_weight(user_id, date DESC);

-- Create indexes for body_measurements
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_id ON public.body_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_body_measurements_date ON public.body_measurements(date);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date ON public.body_measurements(user_id, date DESC);

-- Create indexes for dexa_scans
CREATE INDEX IF NOT EXISTS idx_dexa_scans_user_id ON public.dexa_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_dexa_scans_date ON public.dexa_scans(date);
CREATE INDEX IF NOT EXISTS idx_dexa_scans_user_date ON public.dexa_scans(user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE public.daily_weight ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dexa_scans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_weight
CREATE POLICY "Users can view own weight data"
    ON public.daily_weight FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight data"
    ON public.daily_weight FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight data"
    ON public.daily_weight FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight data"
    ON public.daily_weight FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for body_measurements
CREATE POLICY "Users can view own measurements"
    ON public.body_measurements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements"
    ON public.body_measurements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements"
    ON public.body_measurements FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements"
    ON public.body_measurements FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for dexa_scans
CREATE POLICY "Users can view own dexa scans"
    ON public.dexa_scans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dexa scans"
    ON public.dexa_scans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dexa scans"
    ON public.dexa_scans FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dexa scans"
    ON public.dexa_scans FOR DELETE
    USING (auth.uid() = user_id);

-- Add comments to tables
COMMENT ON TABLE public.daily_weight IS 'Daily weight and body fat percentage tracking';
COMMENT ON TABLE public.body_measurements IS 'Body circumference measurements tracking';
COMMENT ON TABLE public.dexa_scans IS 'DEXA scan results for detailed body composition analysis';

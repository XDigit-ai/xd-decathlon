-- Migration: Hevy analytics tables
-- Description: Calculated metrics from workout data - 1RM estimates, volume tracking, PRs

-- Create 1RM formula enum
CREATE TYPE public.one_rm_formula AS ENUM (
    'epley',
    'brzycki',
    'lombardi',
    'mayhew',
    'oconner',
    'wathan'
);

-- Create record_type enum
CREATE TYPE public.record_type AS ENUM (
    '1rm',
    'max_weight',
    'max_reps',
    'max_volume'
);

-- Create estimated_1rm table
CREATE TABLE IF NOT EXISTS public.estimated_1rm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_template_id UUID NOT NULL REFERENCES public.exercise_templates(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    estimated_1rm_kg NUMERIC(7,2) NOT NULL CHECK (estimated_1rm_kg > 0),
    best_set_weight NUMERIC(7,2) NOT NULL CHECK (best_set_weight > 0),
    best_set_reps INTEGER NOT NULL CHECK (best_set_reps > 0),
    formula public.one_rm_formula NOT NULL DEFAULT 'epley',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_exercise_date_1rm UNIQUE (user_id, exercise_template_id, date)
);

-- Create weekly_volume table
CREATE TABLE IF NOT EXISTS public.weekly_volume (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    muscle_group TEXT NOT NULL,
    total_sets INTEGER NOT NULL DEFAULT 0 CHECK (total_sets >= 0),
    total_volume_kg NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_volume_kg >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_week_muscle UNIQUE (user_id, week_start, muscle_group)
);

-- Create personal_records table
CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_template_id UUID NOT NULL REFERENCES public.exercise_templates(id) ON DELETE CASCADE,
    record_type public.record_type NOT NULL,
    value NUMERIC(10,2) NOT NULL CHECK (value > 0),
    previous_value NUMERIC(10,2) CHECK (previous_value > 0),
    date DATE NOT NULL,
    workout_id UUID REFERENCES public.hevy_workouts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_pr_improvement CHECK (
        previous_value IS NULL OR value > previous_value
    )
);

-- Create indexes for estimated_1rm
CREATE INDEX IF NOT EXISTS idx_estimated_1rm_user_id ON public.estimated_1rm(user_id);
CREATE INDEX IF NOT EXISTS idx_estimated_1rm_exercise ON public.estimated_1rm(exercise_template_id);
CREATE INDEX IF NOT EXISTS idx_estimated_1rm_date ON public.estimated_1rm(date DESC);
CREATE INDEX IF NOT EXISTS idx_estimated_1rm_user_exercise ON public.estimated_1rm(user_id, exercise_template_id, date DESC);

-- Create indexes for weekly_volume
CREATE INDEX IF NOT EXISTS idx_weekly_volume_user_id ON public.weekly_volume(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_volume_week ON public.weekly_volume(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_volume_muscle ON public.weekly_volume(muscle_group);
CREATE INDEX IF NOT EXISTS idx_weekly_volume_user_week ON public.weekly_volume(user_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_volume_user_muscle ON public.weekly_volume(user_id, muscle_group, week_start DESC);

-- Create indexes for personal_records
CREATE INDEX IF NOT EXISTS idx_personal_records_user_id ON public.personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON public.personal_records(exercise_template_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_type ON public.personal_records(record_type);
CREATE INDEX IF NOT EXISTS idx_personal_records_date ON public.personal_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_personal_records_user_exercise ON public.personal_records(user_id, exercise_template_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_personal_records_workout ON public.personal_records(workout_id);

-- Enable Row Level Security
ALTER TABLE public.estimated_1rm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_volume ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for estimated_1rm
CREATE POLICY "Users can view own 1RM estimates"
    ON public.estimated_1rm FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own 1RM estimates"
    ON public.estimated_1rm FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own 1RM estimates"
    ON public.estimated_1rm FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own 1RM estimates"
    ON public.estimated_1rm FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for weekly_volume
CREATE POLICY "Users can view own weekly volume"
    ON public.weekly_volume FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly volume"
    ON public.weekly_volume FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly volume"
    ON public.weekly_volume FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly volume"
    ON public.weekly_volume FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for personal_records
CREATE POLICY "Users can view own personal records"
    ON public.personal_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personal records"
    ON public.personal_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal records"
    ON public.personal_records FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal records"
    ON public.personal_records FOR DELETE
    USING (auth.uid() = user_id);

-- Add comments to tables
COMMENT ON TABLE public.estimated_1rm IS 'Calculated one-rep max estimates from workout sets';
COMMENT ON TABLE public.weekly_volume IS 'Aggregated weekly training volume by muscle group';
COMMENT ON TABLE public.personal_records IS 'Personal records tracked across different metrics';

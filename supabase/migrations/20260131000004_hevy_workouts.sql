-- Migration: Hevy workout data tables
-- Description: Workouts, exercises, sets, and exercise templates from Hevy

-- Create set_type enum
CREATE TYPE public.set_type AS ENUM (
    'normal',
    'warmup',
    'failure',
    'drop'
);

-- Create hevy_workouts table
CREATE TABLE IF NOT EXISTS public.hevy_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hevy_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_volume_kg NUMERIC(10,2) CHECK (total_volume_kg >= 0),
    total_sets INTEGER CHECK (total_sets >= 0),
    raw_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_workout_time CHECK (end_time > start_time)
);

-- Create exercise_templates table
CREATE TABLE IF NOT EXISTS public.exercise_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hevy_template_id TEXT UNIQUE,
    title TEXT NOT NULL,
    muscle_group TEXT,
    equipment TEXT,
    is_key_lift BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_exercise_title UNIQUE (user_id, title)
);

-- Create hevy_workout_exercises table
CREATE TABLE IF NOT EXISTS public.hevy_workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_id UUID NOT NULL REFERENCES public.hevy_workouts(id) ON DELETE CASCADE,
    hevy_exercise_id TEXT NOT NULL,
    title TEXT NOT NULL,
    exercise_index INTEGER NOT NULL CHECK (exercise_index >= 0),
    superset_id INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_workout_exercise UNIQUE (workout_id, exercise_index)
);

-- Create hevy_sets table
CREATE TABLE IF NOT EXISTS public.hevy_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.hevy_workout_exercises(id) ON DELETE CASCADE,
    set_index INTEGER NOT NULL CHECK (set_index >= 0),
    set_type public.set_type NOT NULL DEFAULT 'normal',
    weight_kg NUMERIC(7,2) CHECK (weight_kg >= 0),
    reps INTEGER CHECK (reps >= 0),
    rpe NUMERIC(3,1) CHECK (rpe >= 0 AND rpe <= 10),
    duration_seconds INTEGER CHECK (duration_seconds >= 0),
    distance_meters NUMERIC(10,2) CHECK (distance_meters >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_exercise_set UNIQUE (exercise_id, set_index)
);

-- Create indexes for hevy_workouts
CREATE INDEX IF NOT EXISTS idx_hevy_workouts_user_id ON public.hevy_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_hevy_workouts_start_time ON public.hevy_workouts(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_hevy_workouts_user_start ON public.hevy_workouts(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_hevy_workouts_hevy_id ON public.hevy_workouts(hevy_id);

-- Create indexes for exercise_templates
CREATE INDEX IF NOT EXISTS idx_exercise_templates_user_id ON public.exercise_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_templates_muscle_group ON public.exercise_templates(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercise_templates_key_lift ON public.exercise_templates(is_key_lift) WHERE is_key_lift = TRUE;
CREATE INDEX IF NOT EXISTS idx_exercise_templates_hevy_id ON public.exercise_templates(hevy_template_id);

-- Create indexes for hevy_workout_exercises
CREATE INDEX IF NOT EXISTS idx_hevy_exercises_user_id ON public.hevy_workout_exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_hevy_exercises_workout_id ON public.hevy_workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_hevy_exercises_hevy_id ON public.hevy_workout_exercises(hevy_exercise_id);

-- Create indexes for hevy_sets
CREATE INDEX IF NOT EXISTS idx_hevy_sets_user_id ON public.hevy_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_hevy_sets_exercise_id ON public.hevy_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_hevy_sets_set_type ON public.hevy_sets(set_type);

-- Enable Row Level Security
ALTER TABLE public.hevy_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hevy_workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hevy_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hevy_workouts
CREATE POLICY "Users can view own workouts"
    ON public.hevy_workouts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
    ON public.hevy_workouts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
    ON public.hevy_workouts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
    ON public.hevy_workouts FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for exercise_templates
CREATE POLICY "Users can view own exercise templates"
    ON public.exercise_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise templates"
    ON public.exercise_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise templates"
    ON public.exercise_templates FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise templates"
    ON public.exercise_templates FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for hevy_workout_exercises
CREATE POLICY "Users can view own workout exercises"
    ON public.hevy_workout_exercises FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout exercises"
    ON public.hevy_workout_exercises FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout exercises"
    ON public.hevy_workout_exercises FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout exercises"
    ON public.hevy_workout_exercises FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for hevy_sets
CREATE POLICY "Users can view own sets"
    ON public.hevy_sets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sets"
    ON public.hevy_sets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sets"
    ON public.hevy_sets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sets"
    ON public.hevy_sets FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to automatically update updated_at on hevy_workouts
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.hevy_workouts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comments to tables
COMMENT ON TABLE public.hevy_workouts IS 'Workout sessions imported from Hevy app';
COMMENT ON TABLE public.exercise_templates IS 'Exercise templates with metadata for tracking and analytics';
COMMENT ON TABLE public.hevy_workout_exercises IS 'Individual exercises within a workout session';
COMMENT ON TABLE public.hevy_sets IS 'Individual sets within workout exercises';

-- Migration: WHOOP data tables
-- Description: Recovery, sleep, workouts, and daily cycles from WHOOP

-- Create traffic_light enum
CREATE TYPE public.traffic_light AS ENUM (
    'green',
    'yellow',
    'red'
);

-- Create whoop_recovery table
CREATE TABLE IF NOT EXISTS public.whoop_recovery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    whoop_id TEXT NOT NULL UNIQUE,
    date DATE NOT NULL,
    recovery_score NUMERIC(5,2) CHECK (recovery_score >= 0 AND recovery_score <= 100),
    hrv_rmssd NUMERIC(7,2) CHECK (hrv_rmssd >= 0),
    resting_hr NUMERIC(5,2) CHECK (resting_hr > 0 AND resting_hr < 200),
    spo2_pct NUMERIC(4,1) CHECK (spo2_pct >= 0 AND spo2_pct <= 100),
    skin_temp_celsius NUMERIC(4,1) CHECK (skin_temp_celsius > 0 AND skin_temp_celsius < 50),
    traffic_light public.traffic_light,
    raw_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_recovery_date UNIQUE (user_id, date)
);

-- Create whoop_sleep table
CREATE TABLE IF NOT EXISTS public.whoop_sleep (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    whoop_id TEXT NOT NULL UNIQUE,
    date DATE NOT NULL,
    total_duration_minutes INTEGER CHECK (total_duration_minutes >= 0),
    rem_minutes INTEGER CHECK (rem_minutes >= 0),
    deep_minutes INTEGER CHECK (deep_minutes >= 0),
    light_minutes INTEGER CHECK (light_minutes >= 0),
    awake_minutes INTEGER CHECK (awake_minutes >= 0),
    sleep_performance NUMERIC(5,2) CHECK (sleep_performance >= 0 AND sleep_performance <= 100),
    respiratory_rate NUMERIC(4,1) CHECK (respiratory_rate >= 0 AND respiratory_rate < 100),
    raw_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_sleep_date UNIQUE (user_id, date),
    CONSTRAINT valid_sleep_breakdown CHECK (
        total_duration_minutes IS NULL OR
        (rem_minutes + deep_minutes + light_minutes + awake_minutes) <= total_duration_minutes
    )
);

-- Create whoop_workouts table
CREATE TABLE IF NOT EXISTS public.whoop_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    whoop_id TEXT NOT NULL UNIQUE,
    date DATE NOT NULL,
    sport_name TEXT,
    duration_minutes INTEGER CHECK (duration_minutes > 0),
    strain NUMERIC(5,2) CHECK (strain >= 0 AND strain <= 21),
    avg_hr INTEGER CHECK (avg_hr > 0 AND avg_hr < 250),
    max_hr INTEGER CHECK (max_hr > 0 AND max_hr < 250),
    kilojoules NUMERIC(7,2) CHECK (kilojoules >= 0),
    zone1_minutes INTEGER DEFAULT 0 CHECK (zone1_minutes >= 0),
    zone2_minutes INTEGER DEFAULT 0 CHECK (zone2_minutes >= 0),
    zone3_minutes INTEGER DEFAULT 0 CHECK (zone3_minutes >= 0),
    zone4_minutes INTEGER DEFAULT 0 CHECK (zone4_minutes >= 0),
    zone5_minutes INTEGER DEFAULT 0 CHECK (zone5_minutes >= 0),
    raw_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_hr_range CHECK (avg_hr IS NULL OR max_hr IS NULL OR avg_hr <= max_hr),
    CONSTRAINT valid_zone_breakdown CHECK (
        duration_minutes IS NULL OR
        (zone1_minutes + zone2_minutes + zone3_minutes + zone4_minutes + zone5_minutes) <= duration_minutes
    )
);

-- Create whoop_cycles table
CREATE TABLE IF NOT EXISTS public.whoop_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    whoop_id TEXT NOT NULL UNIQUE,
    date DATE NOT NULL,
    strain NUMERIC(5,2) CHECK (strain >= 0 AND strain <= 21),
    kilojoules NUMERIC(7,2) CHECK (kilojoules >= 0),
    avg_hr INTEGER CHECK (avg_hr > 0 AND avg_hr < 250),
    max_hr INTEGER CHECK (max_hr > 0 AND max_hr < 250),
    raw_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_cycle_date UNIQUE (user_id, date),
    CONSTRAINT valid_cycle_hr_range CHECK (avg_hr IS NULL OR max_hr IS NULL OR avg_hr <= max_hr)
);

-- Create indexes for whoop_recovery
CREATE INDEX IF NOT EXISTS idx_whoop_recovery_user_id ON public.whoop_recovery(user_id);
CREATE INDEX IF NOT EXISTS idx_whoop_recovery_date ON public.whoop_recovery(date DESC);
CREATE INDEX IF NOT EXISTS idx_whoop_recovery_user_date ON public.whoop_recovery(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_whoop_recovery_traffic ON public.whoop_recovery(traffic_light);
CREATE INDEX IF NOT EXISTS idx_whoop_recovery_whoop_id ON public.whoop_recovery(whoop_id);

-- Create indexes for whoop_sleep
CREATE INDEX IF NOT EXISTS idx_whoop_sleep_user_id ON public.whoop_sleep(user_id);
CREATE INDEX IF NOT EXISTS idx_whoop_sleep_date ON public.whoop_sleep(date DESC);
CREATE INDEX IF NOT EXISTS idx_whoop_sleep_user_date ON public.whoop_sleep(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_whoop_sleep_whoop_id ON public.whoop_sleep(whoop_id);

-- Create indexes for whoop_workouts
CREATE INDEX IF NOT EXISTS idx_whoop_workouts_user_id ON public.whoop_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_whoop_workouts_date ON public.whoop_workouts(date DESC);
CREATE INDEX IF NOT EXISTS idx_whoop_workouts_user_date ON public.whoop_workouts(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_whoop_workouts_sport ON public.whoop_workouts(sport_name);
CREATE INDEX IF NOT EXISTS idx_whoop_workouts_whoop_id ON public.whoop_workouts(whoop_id);

-- Create indexes for whoop_cycles
CREATE INDEX IF NOT EXISTS idx_whoop_cycles_user_id ON public.whoop_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_whoop_cycles_date ON public.whoop_cycles(date DESC);
CREATE INDEX IF NOT EXISTS idx_whoop_cycles_user_date ON public.whoop_cycles(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_whoop_cycles_whoop_id ON public.whoop_cycles(whoop_id);

-- Enable Row Level Security
ALTER TABLE public.whoop_recovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whoop_sleep ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whoop_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whoop_cycles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whoop_recovery
CREATE POLICY "Users can view own recovery data"
    ON public.whoop_recovery FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recovery data"
    ON public.whoop_recovery FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recovery data"
    ON public.whoop_recovery FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recovery data"
    ON public.whoop_recovery FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for whoop_sleep
CREATE POLICY "Users can view own sleep data"
    ON public.whoop_sleep FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep data"
    ON public.whoop_sleep FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep data"
    ON public.whoop_sleep FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep data"
    ON public.whoop_sleep FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for whoop_workouts
CREATE POLICY "Users can view own workout data"
    ON public.whoop_workouts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout data"
    ON public.whoop_workouts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout data"
    ON public.whoop_workouts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout data"
    ON public.whoop_workouts FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for whoop_cycles
CREATE POLICY "Users can view own cycle data"
    ON public.whoop_cycles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycle data"
    ON public.whoop_cycles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycle data"
    ON public.whoop_cycles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycle data"
    ON public.whoop_cycles FOR DELETE
    USING (auth.uid() = user_id);

-- Add comments to tables
COMMENT ON TABLE public.whoop_recovery IS 'Daily recovery metrics from WHOOP including HRV, resting HR, and recovery score';
COMMENT ON TABLE public.whoop_sleep IS 'Sleep tracking data from WHOOP including stages and performance';
COMMENT ON TABLE public.whoop_workouts IS 'Individual workout activities tracked by WHOOP';
COMMENT ON TABLE public.whoop_cycles IS 'Daily physiological cycles from WHOOP showing overall strain and load';

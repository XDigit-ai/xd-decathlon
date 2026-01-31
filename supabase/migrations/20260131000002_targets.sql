-- Migration: Targets table
-- Description: SMART goals per domain with baseline and multi-timeframe targets

-- Create domain enum type
CREATE TYPE public.target_domain AS ENUM (
    'body_fat',
    'vo2_max',
    'squat_1rm',
    'bench_1rm',
    'deadlift_1rm',
    'ohp_1rm',
    'row_1rm',
    'dead_hang',
    'farmer_walk',
    'plank',
    'wall_sit',
    'pull_ups',
    'balance_open',
    'balance_closed',
    'grip_strength',
    'mile_run',
    'deadlift_reps',
    'weight'
);

-- Create status enum type
CREATE TYPE public.target_status AS ENUM (
    'active',
    'achieved',
    'abandoned',
    'revised'
);

-- Create targets table
CREATE TABLE IF NOT EXISTS public.targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    domain public.target_domain NOT NULL,
    metric_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    baseline NUMERIC(10,2),
    target_3m NUMERIC(10,2),
    target_6m NUMERIC(10,2),
    target_12m NUMERIC(10,2),
    current_value NUMERIC(10,2),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status public.target_status NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_targets CHECK (
        (target_3m IS NULL OR baseline IS NULL OR target_3m != baseline) AND
        (target_6m IS NULL OR baseline IS NULL OR target_6m != baseline) AND
        (target_12m IS NULL OR baseline IS NULL OR target_12m != baseline)
    )
);

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_targets_user_id ON public.targets(user_id);
CREATE INDEX IF NOT EXISTS idx_targets_domain ON public.targets(domain);
CREATE INDEX IF NOT EXISTS idx_targets_status ON public.targets(status);
CREATE INDEX IF NOT EXISTS idx_targets_user_domain ON public.targets(user_id, domain);
CREATE INDEX IF NOT EXISTS idx_targets_user_status ON public.targets(user_id, status);

-- Enable Row Level Security
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view only their own targets
CREATE POLICY "Users can view own targets"
    ON public.targets
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert only their own targets
CREATE POLICY "Users can insert own targets"
    ON public.targets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update only their own targets
CREATE POLICY "Users can update own targets"
    ON public.targets
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete only their own targets
CREATE POLICY "Users can delete own targets"
    ON public.targets
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.targets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comment to table
COMMENT ON TABLE public.targets IS 'SMART goals per fitness domain with baseline and multi-timeframe targets';

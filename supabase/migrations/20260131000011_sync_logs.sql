-- Migration: Sync logs and HR zones tables
-- Description: Integration sync tracking and heart rate zone configuration

-- Create sync_status enum
CREATE TYPE public.sync_status AS ENUM (
    'started',
    'completed',
    'failed'
);

-- Create sync_type enum
CREATE TYPE public.sync_type AS ENUM (
    'full',
    'incremental',
    'webhook'
);

-- Create hr_zone_method enum
CREATE TYPE public.hr_zone_method AS ENUM (
    'karvonen',
    'percentage_max',
    'custom'
);

-- Create sync_logs table
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider public.integration_provider NOT NULL,
    sync_type public.sync_type NOT NULL,
    status public.sync_status NOT NULL,
    records_processed INTEGER DEFAULT 0 CHECK (records_processed >= 0),
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_sync_completion CHECK (
        (status = 'completed' AND completed_at IS NOT NULL) OR
        (status = 'failed' AND completed_at IS NOT NULL) OR
        (status = 'started' AND completed_at IS NULL)
    ),
    CONSTRAINT valid_sync_duration CHECK (
        completed_at IS NULL OR completed_at >= started_at
    )
);

-- Create hr_zones table
CREATE TABLE IF NOT EXISTS public.hr_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resting_hr INTEGER NOT NULL CHECK (resting_hr > 0 AND resting_hr < 200),
    max_hr INTEGER NOT NULL CHECK (max_hr > 0 AND max_hr < 250),
    zone1_low INTEGER NOT NULL CHECK (zone1_low > 0),
    zone1_high INTEGER NOT NULL CHECK (zone1_high > 0),
    zone2_low INTEGER NOT NULL CHECK (zone2_low > 0),
    zone2_high INTEGER NOT NULL CHECK (zone2_high > 0),
    zone3_low INTEGER NOT NULL CHECK (zone3_low > 0),
    zone3_high INTEGER NOT NULL CHECK (zone3_high > 0),
    zone4_low INTEGER NOT NULL CHECK (zone4_low > 0),
    zone4_high INTEGER NOT NULL CHECK (zone4_high > 0),
    zone5_low INTEGER NOT NULL CHECK (zone5_low > 0),
    zone5_high INTEGER NOT NULL CHECK (zone5_high > 0),
    method public.hr_zone_method NOT NULL DEFAULT 'karvonen',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_hr_zones UNIQUE (user_id),
    CONSTRAINT valid_hr_range CHECK (max_hr > resting_hr),
    CONSTRAINT valid_zone1 CHECK (zone1_high >= zone1_low),
    CONSTRAINT valid_zone2 CHECK (zone2_high >= zone2_low AND zone2_low >= zone1_high),
    CONSTRAINT valid_zone3 CHECK (zone3_high >= zone3_low AND zone3_low >= zone2_high),
    CONSTRAINT valid_zone4 CHECK (zone4_high >= zone4_low AND zone4_low >= zone3_high),
    CONSTRAINT valid_zone5 CHECK (zone5_high >= zone5_low AND zone5_low >= zone4_high AND zone5_high <= max_hr)
);

-- Create indexes for sync_logs
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON public.sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_provider ON public.sync_logs(provider);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON public.sync_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_provider ON public.sync_logs(user_id, provider, started_at DESC);

-- Create indexes for hr_zones
CREATE INDEX IF NOT EXISTS idx_hr_zones_user_id ON public.hr_zones(user_id);

-- Enable Row Level Security
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_zones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sync_logs
CREATE POLICY "Users can view own sync logs"
    ON public.sync_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync logs"
    ON public.sync_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync logs"
    ON public.sync_logs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sync logs"
    ON public.sync_logs
    FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for hr_zones
CREATE POLICY "Users can view own HR zones"
    ON public.hr_zones
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own HR zones"
    ON public.hr_zones
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own HR zones"
    ON public.hr_zones
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own HR zones"
    ON public.hr_zones
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to automatically update updated_at on hr_zones
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.hr_zones
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to calculate HR zones using Karvonen method
CREATE OR REPLACE FUNCTION public.calculate_hr_zones_karvonen(
    p_user_id UUID,
    p_resting_hr INTEGER,
    p_max_hr INTEGER
)
RETURNS void AS $$
DECLARE
    hr_reserve INTEGER;
BEGIN
    hr_reserve := p_max_hr - p_resting_hr;

    INSERT INTO public.hr_zones (
        user_id,
        resting_hr,
        max_hr,
        zone1_low,
        zone1_high,
        zone2_low,
        zone2_high,
        zone3_low,
        zone3_high,
        zone4_low,
        zone4_high,
        zone5_low,
        zone5_high,
        method
    ) VALUES (
        p_user_id,
        p_resting_hr,
        p_max_hr,
        p_resting_hr + ROUND(hr_reserve * 0.50),  -- Zone 1: 50-60%
        p_resting_hr + ROUND(hr_reserve * 0.60),
        p_resting_hr + ROUND(hr_reserve * 0.60),  -- Zone 2: 60-70%
        p_resting_hr + ROUND(hr_reserve * 0.70),
        p_resting_hr + ROUND(hr_reserve * 0.70),  -- Zone 3: 70-80%
        p_resting_hr + ROUND(hr_reserve * 0.80),
        p_resting_hr + ROUND(hr_reserve * 0.80),  -- Zone 4: 80-90%
        p_resting_hr + ROUND(hr_reserve * 0.90),
        p_resting_hr + ROUND(hr_reserve * 0.90),  -- Zone 5: 90-100%
        p_max_hr,
        'karvonen'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        resting_hr = EXCLUDED.resting_hr,
        max_hr = EXCLUDED.max_hr,
        zone1_low = EXCLUDED.zone1_low,
        zone1_high = EXCLUDED.zone1_high,
        zone2_low = EXCLUDED.zone2_low,
        zone2_high = EXCLUDED.zone2_high,
        zone3_low = EXCLUDED.zone3_low,
        zone3_high = EXCLUDED.zone3_high,
        zone4_low = EXCLUDED.zone4_low,
        zone4_high = EXCLUDED.zone4_high,
        zone5_low = EXCLUDED.zone5_low,
        zone5_high = EXCLUDED.zone5_high,
        method = EXCLUDED.method,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments to tables
COMMENT ON TABLE public.sync_logs IS 'Tracking logs for integration syncs with WHOOP and Hevy';
COMMENT ON TABLE public.hr_zones IS 'User-specific heart rate zones calculated using Karvonen or other methods';
COMMENT ON FUNCTION public.calculate_hr_zones_karvonen IS 'Calculate and upsert HR zones using the Karvonen formula';

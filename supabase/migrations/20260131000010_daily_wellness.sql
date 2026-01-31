-- Migration: Daily wellness table
-- Description: Subjective daily wellness metrics for holistic tracking

-- Create daily_wellness table
CREATE TABLE IF NOT EXISTS public.daily_wellness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    energy INTEGER CHECK (energy >= 1 AND energy <= 5),
    mood INTEGER CHECK (mood >= 1 AND mood <= 5),
    soreness INTEGER CHECK (soreness >= 1 AND soreness <= 5),
    motivation INTEGER CHECK (motivation >= 1 AND motivation <= 5),
    stress INTEGER CHECK (stress >= 1 AND stress <= 5),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_wellness_date UNIQUE (user_id, date)
);

-- Create indexes for daily_wellness
CREATE INDEX IF NOT EXISTS idx_daily_wellness_user_id ON public.daily_wellness(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_wellness_date ON public.daily_wellness(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_wellness_user_date ON public.daily_wellness(user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE public.daily_wellness ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view only their own wellness data
CREATE POLICY "Users can view own wellness data"
    ON public.daily_wellness
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert only their own wellness data
CREATE POLICY "Users can insert own wellness data"
    ON public.daily_wellness
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update only their own wellness data
CREATE POLICY "Users can update own wellness data"
    ON public.daily_wellness
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete only their own wellness data
CREATE POLICY "Users can delete own wellness data"
    ON public.daily_wellness
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE public.daily_wellness IS 'Daily subjective wellness metrics tracked on a 1-5 scale';
COMMENT ON COLUMN public.daily_wellness.energy IS 'Energy level (1=very low, 5=very high)';
COMMENT ON COLUMN public.daily_wellness.mood IS 'Mood (1=very poor, 5=excellent)';
COMMENT ON COLUMN public.daily_wellness.soreness IS 'Muscle soreness (1=none, 5=extreme)';
COMMENT ON COLUMN public.daily_wellness.motivation IS 'Training motivation (1=very low, 5=very high)';
COMMENT ON COLUMN public.daily_wellness.stress IS 'Stress level (1=very low, 5=very high)';

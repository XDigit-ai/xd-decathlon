-- Migration: Reviews table
-- Description: Weekly, monthly, and quarterly performance reviews with auto-populated metrics

-- Create review_type enum
CREATE TYPE public.review_type AS ENUM (
    'weekly',
    'monthly',
    'quarterly'
);

-- Create review_status enum
CREATE TYPE public.review_status AS ENUM (
    'draft',
    'completed'
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    review_type public.review_type NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status public.review_status NOT NULL DEFAULT 'draft',
    auto_data JSONB DEFAULT '{}'::jsonb,
    manual_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_review_period CHECK (period_end > period_start),
    CONSTRAINT unique_user_review_period UNIQUE (user_id, review_type, period_start)
);

-- Create indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_review_type ON public.reviews(review_type);
CREATE INDEX IF NOT EXISTS idx_reviews_period_start ON public.reviews(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_user_type_period ON public.reviews(user_id, review_type, period_start DESC);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view only their own reviews
CREATE POLICY "Users can view own reviews"
    ON public.reviews
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert only their own reviews
CREATE POLICY "Users can insert own reviews"
    ON public.reviews
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update only their own reviews
CREATE POLICY "Users can update own reviews"
    ON public.reviews
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete only their own reviews
CREATE POLICY "Users can delete own reviews"
    ON public.reviews
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comment to table
COMMENT ON TABLE public.reviews IS 'Periodic performance reviews with auto-populated metrics and manual entries';
COMMENT ON COLUMN public.reviews.auto_data IS 'Auto-populated metrics calculated from workout, WHOOP, and body composition data';
COMMENT ON COLUMN public.reviews.manual_data IS 'User-entered fields including reflections, goals, and notes';
COMMENT ON COLUMN public.reviews.period_start IS 'Start date of the review period (inclusive)';
COMMENT ON COLUMN public.reviews.period_end IS 'End date of the review period (inclusive)';

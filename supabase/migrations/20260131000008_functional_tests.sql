-- Migration: Functional tests table
-- Description: Performance tracking for functional fitness assessments

-- Create test_type enum
CREATE TYPE public.test_type AS ENUM (
    'dead_hang',
    'farmer_walk',
    'plank',
    'wall_sit',
    'pull_ups',
    'balance_open_l',
    'balance_open_r',
    'balance_closed_l',
    'balance_closed_r',
    'floor_getup',
    'deadlift_reps',
    'grip_l',
    'grip_r',
    'mile_run'
);

-- Create functional_tests table
CREATE TABLE IF NOT EXISTS public.functional_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    test_type public.test_type NOT NULL,
    value NUMERIC(10,2) NOT NULL CHECK (value > 0),
    unit TEXT NOT NULL CHECK (unit IN ('seconds', 'reps', 'kg', 'mm:ss', 'pass', 'fail')),
    load_kg NUMERIC(7,2) CHECK (load_kg >= 0),
    notes TEXT,
    is_pr BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_unit_for_test CHECK (
        (test_type IN ('dead_hang', 'farmer_walk', 'plank', 'wall_sit') AND unit = 'seconds') OR
        (test_type IN ('pull_ups', 'deadlift_reps') AND unit = 'reps') OR
        (test_type IN ('grip_l', 'grip_r') AND unit = 'kg') OR
        (test_type = 'mile_run' AND unit = 'mm:ss') OR
        (test_type IN ('balance_open_l', 'balance_open_r', 'balance_closed_l', 'balance_closed_r', 'floor_getup') AND unit IN ('pass', 'fail', 'seconds'))
    )
);

-- Create indexes for functional_tests
CREATE INDEX IF NOT EXISTS idx_functional_tests_user_id ON public.functional_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_functional_tests_test_type ON public.functional_tests(test_type);
CREATE INDEX IF NOT EXISTS idx_functional_tests_date ON public.functional_tests(date DESC);
CREATE INDEX IF NOT EXISTS idx_functional_tests_user_type_date ON public.functional_tests(user_id, test_type, date DESC);
CREATE INDEX IF NOT EXISTS idx_functional_tests_is_pr ON public.functional_tests(is_pr) WHERE is_pr = TRUE;

-- Enable Row Level Security
ALTER TABLE public.functional_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view only their own functional tests
CREATE POLICY "Users can view own functional tests"
    ON public.functional_tests
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert only their own functional tests
CREATE POLICY "Users can insert own functional tests"
    ON public.functional_tests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update only their own functional tests
CREATE POLICY "Users can update own functional tests"
    ON public.functional_tests
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete only their own functional tests
CREATE POLICY "Users can delete own functional tests"
    ON public.functional_tests
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically mark PRs
CREATE OR REPLACE FUNCTION public.check_functional_test_pr()
RETURNS TRIGGER AS $$
DECLARE
    max_existing_value NUMERIC(10,2);
BEGIN
    -- For tests where higher is better (all except mile_run)
    IF NEW.test_type != 'mile_run' THEN
        SELECT MAX(value) INTO max_existing_value
        FROM public.functional_tests
        WHERE user_id = NEW.user_id
        AND test_type = NEW.test_type
        AND date < NEW.date;

        IF max_existing_value IS NULL OR NEW.value > max_existing_value THEN
            NEW.is_pr := TRUE;
        END IF;
    ELSE
        -- For mile_run, lower is better
        SELECT MIN(value) INTO max_existing_value
        FROM public.functional_tests
        WHERE user_id = NEW.user_id
        AND test_type = NEW.test_type
        AND date < NEW.date;

        IF max_existing_value IS NULL OR NEW.value < max_existing_value THEN
            NEW.is_pr := TRUE;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically check for PRs
CREATE TRIGGER check_pr_before_insert
    BEFORE INSERT ON public.functional_tests
    FOR EACH ROW
    EXECUTE FUNCTION public.check_functional_test_pr();

-- Add comment to table
COMMENT ON TABLE public.functional_tests IS 'Functional fitness assessments and performance tests';
COMMENT ON COLUMN public.functional_tests.test_type IS 'Type of functional test performed';
COMMENT ON COLUMN public.functional_tests.value IS 'Test result value in specified unit';
COMMENT ON COLUMN public.functional_tests.load_kg IS 'External load used for loaded tests (e.g., farmer walk weight)';
COMMENT ON COLUMN public.functional_tests.is_pr IS 'Automatically marked TRUE if this is a personal record';

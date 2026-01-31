-- Migration: Add duration_seconds to hevy_workouts
-- Description: Sync code calculates workout duration from start_time/end_time

ALTER TABLE public.hevy_workouts
    ADD COLUMN IF NOT EXISTS duration_seconds INTEGER CHECK (duration_seconds >= 0);

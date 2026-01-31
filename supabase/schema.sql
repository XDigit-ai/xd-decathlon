-- AK Fitness Dashboard Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profile (single user app)
CREATE TABLE user_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_name TEXT NOT NULL DEFAULT 'AK',
    height_cm DECIMAL(5,2) NOT NULL DEFAULT 175,
    weight_unit TEXT NOT NULL DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),
    distance_unit TEXT NOT NULL DEFAULT 'km' CHECK (distance_unit IN ('km', 'miles')),
    resting_hr INTEGER NOT NULL DEFAULT 56,
    max_hr INTEGER NOT NULL DEFAULT 178,
    hrv_baseline DECIMAL(5,2) NOT NULL DEFAULT 65,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Body Composition: Daily Weight Entries
CREATE TABLE weight_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    weight_kg DECIMAL(5,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weight_entries_date ON weight_entries(date DESC);

-- Body Composition: Bi-weekly Measurements
CREATE TABLE body_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    waist_cm DECIMAL(5,2),
    hips_cm DECIMAL(5,2),
    chest_cm DECIMAL(5,2),
    left_arm_cm DECIMAL(5,2),
    right_arm_cm DECIMAL(5,2),
    left_thigh_cm DECIMAL(5,2),
    right_thigh_cm DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_body_measurements_date ON body_measurements(date DESC);

-- Body Composition: DEXA Scans
CREATE TABLE dexa_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    body_fat_percent DECIMAL(4,2) NOT NULL,
    fat_mass_kg DECIMAL(5,2) NOT NULL,
    lean_mass_kg DECIMAL(5,2) NOT NULL,
    bone_density DECIMAL(4,3),
    visceral_fat_area DECIMAL(6,2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dexa_scans_date ON dexa_scans(date DESC);

-- Strength: Hevy Workouts
CREATE TABLE hevy_workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hevy_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_volume_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_sets INTEGER NOT NULL DEFAULT 0,
    raw_data JSONB NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hevy_workouts_start_time ON hevy_workouts(start_time DESC);
CREATE INDEX idx_hevy_workouts_hevy_id ON hevy_workouts(hevy_id);

-- Strength: Exercises within workouts
CREATE TABLE hevy_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID NOT NULL REFERENCES hevy_workouts(id) ON DELETE CASCADE,
    hevy_exercise_id TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    exercise_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hevy_exercises_workout ON hevy_exercises(workout_id);
CREATE INDEX idx_hevy_exercises_name ON hevy_exercises(exercise_name);

-- Strength: Sets within exercises
CREATE TABLE hevy_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_id UUID NOT NULL REFERENCES hevy_exercises(id) ON DELETE CASCADE,
    set_order INTEGER NOT NULL,
    weight_kg DECIMAL(6,2) NOT NULL,
    reps INTEGER NOT NULL,
    rpe DECIMAL(3,1),
    set_type TEXT NOT NULL DEFAULT 'working' CHECK (set_type IN ('warmup', 'working', 'failure', 'dropset')),
    is_pr BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hevy_sets_exercise ON hevy_sets(exercise_id);

-- Strength: Personal Records
CREATE TABLE personal_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_name TEXT NOT NULL,
    record_type TEXT NOT NULL CHECK (record_type IN ('1rm', 'volume', 'reps')),
    value DECIMAL(10,2) NOT NULL,
    achieved_at TIMESTAMPTZ NOT NULL,
    workout_id UUID REFERENCES hevy_workouts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_personal_records_exercise ON personal_records(exercise_name, record_type);

-- Recovery: Whoop Recovery Data
CREATE TABLE whoop_recovery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    whoop_cycle_id TEXT NOT NULL UNIQUE,
    date DATE NOT NULL,
    recovery_score DECIMAL(5,2) NOT NULL,
    hrv_rmssd DECIMAL(6,2) NOT NULL,
    resting_hr DECIMAL(5,2) NOT NULL,
    skin_temp_celsius DECIMAL(4,2),
    spo2_percent DECIMAL(5,2),
    raw_data JSONB NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_whoop_recovery_date ON whoop_recovery(date DESC);

-- Recovery: Whoop Sleep Data
CREATE TABLE whoop_sleep (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    whoop_sleep_id TEXT NOT NULL UNIQUE,
    date DATE NOT NULL,
    total_sleep_minutes INTEGER NOT NULL,
    rem_minutes INTEGER NOT NULL DEFAULT 0,
    deep_minutes INTEGER NOT NULL DEFAULT 0,
    light_minutes INTEGER NOT NULL DEFAULT 0,
    awake_minutes INTEGER NOT NULL DEFAULT 0,
    sleep_score DECIMAL(5,2) NOT NULL,
    sleep_efficiency DECIMAL(5,2) NOT NULL,
    raw_data JSONB NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_whoop_sleep_date ON whoop_sleep(date DESC);

-- Recovery: Whoop Workout/Strain Data
CREATE TABLE whoop_workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    whoop_workout_id TEXT NOT NULL UNIQUE,
    date DATE NOT NULL,
    sport_name TEXT NOT NULL,
    strain DECIMAL(4,2) NOT NULL,
    average_hr DECIMAL(5,2) NOT NULL,
    max_hr DECIMAL(5,2) NOT NULL,
    calories INTEGER NOT NULL,
    duration_minutes DECIMAL(6,2) NOT NULL,
    hr_zones JSONB,
    raw_data JSONB NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_whoop_workouts_date ON whoop_workouts(date DESC);

-- Whoop OAuth Tokens (encrypted)
CREATE TABLE whoop_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cardio: VO2 Max Entries
CREATE TABLE vo2_max_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    value DECIMAL(4,1) NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('whoop', 'apple_watch', 'cooper_test', 'manual')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vo2_max_entries_date ON vo2_max_entries(date DESC);

-- Cardio: Sessions (Zone 2 and HIIT)
CREATE TABLE cardio_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('zone2', 'hiit_4x4', 'other')),
    duration_minutes INTEGER NOT NULL,
    average_hr INTEGER NOT NULL,
    max_hr INTEGER,
    time_in_zone_percent DECIMAL(5,2),
    intervals_data JSONB,
    notes TEXT,
    whoop_workout_id UUID REFERENCES whoop_workouts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cardio_sessions_date ON cardio_sessions(date DESC);

-- Functional Fitness: Test Results
CREATE TABLE functional_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    test_type TEXT NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    side TEXT CHECK (side IN ('left', 'right', 'both') OR side IS NULL),
    is_pr BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_functional_tests_date ON functional_tests(date DESC);
CREATE INDEX idx_functional_tests_type ON functional_tests(test_type);

-- Targets & Goals
CREATE TABLE targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain TEXT NOT NULL CHECK (domain IN ('body', 'strength', 'cardio', 'recovery', 'functional')),
    metric_name TEXT NOT NULL,
    baseline_value DECIMAL(10,2) NOT NULL,
    target_3m DECIMAL(10,2),
    target_6m DECIMAL(10,2),
    target_12m DECIMAL(10,2),
    current_value DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    is_lower_better BOOLEAN NOT NULL DEFAULT FALSE,
    start_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(domain, metric_name)
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_type TEXT NOT NULL CHECK (review_type IN ('weekly', 'monthly', 'quarterly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_type_period ON reviews(review_type, period_start DESC);

-- Wellness: Daily Subjective Ratings
CREATE TABLE wellness_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
    motivation_level INTEGER CHECK (motivation_level BETWEEN 1 AND 10),
    soreness_level INTEGER CHECK (soreness_level BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wellness_entries_date ON wellness_entries(date DESC);

-- Sync Logs for Audit Trail
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL CHECK (source IN ('hevy', 'whoop')),
    sync_type TEXT NOT NULL CHECK (sync_type IN ('webhook', 'cron', 'manual')),
    status TEXT NOT NULL CHECK (status IN ('success', 'error')),
    records_synced INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_source ON sync_logs(source, created_at DESC);

-- Integration Settings
CREATE TABLE integration_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration TEXT NOT NULL UNIQUE CHECK (integration IN ('hevy', 'whoop')),
    api_key_encrypted TEXT,
    webhook_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    last_sync_at TIMESTAMPTZ,
    last_sync_status TEXT CHECK (last_sync_status IN ('success', 'error') OR last_sync_status IS NULL),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Progress Photos
CREATE TABLE progress_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    photo_type TEXT NOT NULL CHECK (photo_type IN ('front', 'side', 'back')),
    storage_path TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_progress_photos_date ON progress_photos(date DESC);

-- Row Level Security (RLS) - Single user app, enable after adding auth
-- ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
-- etc.

-- Helper function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_profile_updated_at BEFORE UPDATE ON user_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_settings_updated_at BEFORE UPDATE ON integration_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whoop_tokens_updated_at BEFORE UPDATE ON whoop_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default user profile
INSERT INTO user_profile (display_name, height_cm, resting_hr, max_hr, hrv_baseline)
VALUES ('AK', 175, 56, 178, 65);

-- Insert default integration settings
INSERT INTO integration_settings (integration, webhook_enabled)
VALUES ('hevy', false), ('whoop', false);

-- Insert pre-seeded targets from training plan
INSERT INTO targets (domain, metric_name, baseline_value, target_3m, target_6m, target_12m, current_value, unit, is_lower_better, start_date) VALUES
-- Body Composition
('body', 'Body Fat %', 24, 22, 20, 18, 24, '%', true, CURRENT_DATE),
('body', 'Weight', 85, 83, 81, 80, 85, 'kg', true, CURRENT_DATE),

-- Strength (estimated 1RMs)
('strength', 'Squat 1RM', 100, 115, 130, 150, 100, 'kg', false, CURRENT_DATE),
('strength', 'Bench Press 1RM', 80, 90, 100, 110, 80, 'kg', false, CURRENT_DATE),
('strength', 'Deadlift 1RM', 120, 140, 160, 180, 120, 'kg', false, CURRENT_DATE),
('strength', 'OHP 1RM', 50, 57, 65, 72, 50, 'kg', false, CURRENT_DATE),
('strength', 'Barbell Row 1RM', 70, 80, 90, 100, 70, 'kg', false, CURRENT_DATE),

-- Cardio
('cardio', 'VO2 Max', 42, 45, 47, 50, 42, 'mL/kg/min', false, CURRENT_DATE),

-- Recovery
('recovery', 'HRV Baseline', 65, 70, 75, 80, 65, 'ms', false, CURRENT_DATE),

-- Functional
('functional', 'Dead Hang', 45, 70, 95, 120, 45, 'seconds', false, CURRENT_DATE),
('functional', 'Pull-Ups', 5, 7, 8, 10, 5, 'reps', false, CURRENT_DATE),
('functional', 'Grip Strength (L)', 40, 45, 50, 55, 40, 'kg', false, CURRENT_DATE),
('functional', 'Grip Strength (R)', 42, 47, 52, 55, 42, 'kg', false, CURRENT_DATE);

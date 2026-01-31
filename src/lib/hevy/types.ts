/**
 * Hevy API client-specific types
 * Additional types for internal sync operations and API responses
 */

import {
  HevyApiWorkout,
  HevyApiExercise,
  HevyApiSet,
  HevyExerciseTemplate,
} from '@/types/hevy';

// Re-export core types for convenience
export type {
  HevyApiWorkout,
  HevyApiExercise,
  HevyApiSet,
  HevyExerciseTemplate,
};

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface HevyPaginatedResponse<T> {
  page: number;
  page_count: number;
  workout_count?: number;
  workouts?: T[];
  exercise_templates?: T[];
}

export interface HevyWorkoutsResponse {
  page: number;
  page_count: number;
  workout_count: number;
  workouts: HevyApiWorkout[];
}

export interface HevyWorkoutCountResponse {
  workout_count: number;
}

export interface HevyExerciseTemplatesResponse {
  page: number;
  page_count: number;
  exercise_templates: HevyExerciseTemplate[];
}

export interface HevyWorkoutEventsResponse {
  page: number;
  page_count: number;
  events: HevyWorkoutEvent[];
}

export interface HevyWorkoutEvent {
  id: string;
  event_type: 'created' | 'updated' | 'deleted';
  workout_id: string;
  created_at: string;
}

// ============================================================================
// SYNC OPERATION TYPES
// ============================================================================

export interface SyncSummary {
  success: boolean;
  workouts_processed: number;
  exercises_processed: number;
  sets_processed: number;
  one_rms_calculated: number;
  prs_detected: number;
  errors: string[];
  started_at: string;
  completed_at: string;
  duration_ms: number;
}

export interface WorkoutSyncResult {
  workout_id: string;
  hevy_id: string;
  exercises_count: number;
  sets_count: number;
  one_rms_calculated: number;
  prs_detected: number;
  error?: string;
}

// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface DbHevyWorkout {
  id: string;
  user_id: string;
  hevy_id: string;
  title: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  total_volume_kg: number;
  total_sets: number;
  raw_data: any;
  created_at: string;
  updated_at: string;
}

export interface DbExerciseTemplate {
  id: string;
  hevy_id: string;
  title: string;
  muscle_group: string | null;
  secondary_muscle_group: string | null;
  equipment: string | null;
  is_custom: boolean;
  created_at: string;
}

export interface DbWorkoutExercise {
  id: string;
  workout_id: string;
  exercise_template_id: string;
  exercise_index: number;
  notes: string | null;
  created_at: string;
}

export interface DbSet {
  id: string;
  workout_exercise_id: string;
  set_index: number;
  set_type: 'normal' | 'warmup' | 'failure' | 'drop';
  weight_kg: number | null;
  reps: number | null;
  rpe: number | null;
  distance_meters: number | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface DbEstimated1RM {
  id: string;
  user_id: string;
  exercise_template_id: string;
  date: string;
  estimated_1rm_kg: number;
  formula: 'epley';
  source_weight_kg: number | null;
  source_reps: number | null;
  created_at: string;
}

export interface DbPersonalRecord {
  id: string;
  user_id: string;
  exercise_template_id: string;
  record_type: 'one_rm' | 'max_weight' | 'max_volume' | 'max_reps';
  value: number;
  date: string;
  previous_value: number | null;
  created_at: string;
}

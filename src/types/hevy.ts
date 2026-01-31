/**
 * Hevy API response types
 * Types for Hevy API responses, webhooks, and external data structures
 */

// ============================================================================
// HEVY API RESPONSE TYPES
// ============================================================================

export interface HevyApiSet {
  index: number;
  set_type: 'normal' | 'warmup' | 'failure' | 'drop';
  weight_kg?: number;
  reps?: number;
  rpe?: number;
  distance_meters?: number;
  duration_seconds?: number;
}

export interface HevyApiExercise {
  id: string;
  exercise_template_id: string;
  title: string;
  exercise_index: number;
  superset_id?: number;
  notes?: string;
  sets: HevyApiSet[];
}

export interface HevyApiWorkout {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  exercises: HevyApiExercise[];
}

export interface HevyApiResponse<T> {
  data: T[];
  page: number;
  page_count: number;
}

export interface HevyExerciseTemplate {
  id: string;
  title: string;
  muscle_group?: string;
  equipment?: string;
  is_custom: boolean;
}

// ============================================================================
// HEVY WEBHOOK TYPES
// ============================================================================

export type HevyWebhookEventType =
  | 'workout.created'
  | 'workout.updated'
  | 'workout.deleted';

export interface HevyWebhookPayload {
  event: HevyWebhookEventType;
  user_id: string;
  workout: HevyApiWorkout;
  timestamp: string;
}

// ============================================================================
// HEVY INTEGRATION TYPES
// ============================================================================

export interface HevyAuthResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
}

export interface HevySyncResult {
  success: boolean;
  workouts_synced: number;
  exercises_synced: number;
  sets_synced: number;
  errors?: string[];
}

// ============================================================================
// HEVY STATISTICS
// ============================================================================

export interface HevyWorkoutStats {
  total_volume_kg: number;
  total_sets: number;
  total_reps: number;
  duration_minutes: number;
  exercises_count: number;
}

export interface HevyExerciseStats {
  exercise_template_id: string;
  exercise_title: string;
  total_sets: number;
  total_volume_kg: number;
  max_weight_kg: number;
  total_reps: number;
  avg_rpe?: number;
}

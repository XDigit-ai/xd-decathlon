/**
 * Whoop API response types
 * Types for Whoop API responses, webhooks, and external data structures
 */

// ============================================================================
// WHOOP API RESPONSE TYPES
// ============================================================================

export interface WhoopRecoveryResponse {
  cycle_id: string;
  sleep_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score: {
    user_calibrating: boolean;
    recovery_score: number;
    resting_heart_rate: number;
    hrv_rmssd_milli: number;
    spo2_percentage?: number;
    skin_temp_celsius?: number;
  };
}

export interface WhoopSleepResponse {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  nap: boolean;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score?: {
    stage_summary: {
      total_in_bed_time_milli: number;
      total_awake_time_milli: number;
      total_no_data_time_milli: number;
      total_light_sleep_time_milli: number;
      total_slow_wave_sleep_time_milli: number;
      total_rem_sleep_time_milli: number;
      sleep_cycle_count: number;
      disturbance_count: number;
    };
    sleep_needed: {
      baseline_milli: number;
      need_from_sleep_debt_milli: number;
      need_from_recent_strain_milli: number;
      need_from_recent_nap_milli: number;
    };
    respiratory_rate: number;
    sleep_performance_percentage: number;
    sleep_consistency_percentage?: number;
    sleep_efficiency_percentage: number;
  };
}

export interface WhoopWorkoutResponse {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  sport_id: number;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score?: {
    strain: number;
    average_heart_rate: number;
    max_heart_rate: number;
    kilojoule: number;
    percent_recorded: number;
    distance_meter?: number;
    altitude_gain_meter?: number;
    altitude_change_meter?: number;
    zone_duration: {
      zone_zero_milli: number;
      zone_one_milli: number;
      zone_two_milli: number;
      zone_three_milli: number;
      zone_four_milli: number;
      zone_five_milli: number;
    };
  };
  sport: {
    id: number;
    name: string;
  };
}

export interface WhoopCycleResponse {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score?: {
    strain: number;
    kilojoule: number;
    average_heart_rate: number;
    max_heart_rate: number;
  };
}

// ============================================================================
// WHOOP AUTHENTICATION TYPES
// ============================================================================

export interface WhoopTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface WhoopUserProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
}

// ============================================================================
// WHOOP PAGINATION TYPES
// ============================================================================

export interface WhoopPaginatedResponse<T> {
  records: T[];
  next_token?: string;
}

// ============================================================================
// WHOOP WEBHOOK TYPES
// ============================================================================

export type WhoopWebhookEventType =
  | 'recovery.updated'
  | 'sleep.updated'
  | 'workout.updated'
  | 'cycle.updated';

export interface WhoopWebhookPayload {
  type: WhoopWebhookEventType;
  user_id: string;
  data_id: string;
  timestamp: string;
  event_type: 'create' | 'update' | 'delete';
}

// ============================================================================
// WHOOP SYNC TYPES
// ============================================================================

export interface WhoopSyncResult {
  success: boolean;
  recovery_synced: number;
  sleep_synced: number;
  workouts_synced: number;
  cycles_synced: number;
  errors?: string[];
}

// ============================================================================
// WHOOP METRICS TYPES
// ============================================================================

export interface WhoopDailyMetrics {
  date: string;
  recovery_score?: number;
  hrv?: number;
  resting_hr?: number;
  sleep_performance?: number;
  total_strain?: number;
  total_sleep_minutes?: number;
}

export interface WhoopZoneBreakdown {
  zone1_minutes: number;
  zone2_minutes: number;
  zone3_minutes: number;
  zone4_minutes: number;
  zone5_minutes: number;
}

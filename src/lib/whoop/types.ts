/**
 * Whoop API v2 TypeScript Types
 * Based on https://api.prod.whoop.com/developer/v1
 */

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface WhoopPaginatedResponse<T> {
  records: T[];
  next_token: string | null;
}

export interface WhoopPaginationParams {
  limit?: number;
  nextToken?: string;
  start?: string; // ISO datetime
  end?: string;   // ISO datetime
}

// ─── User Profile ────────────────────────────────────────────────────────────

export interface WhoopProfile {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

// ─── Recovery ────────────────────────────────────────────────────────────────

export interface WhoopRecoveryScore {
  user_calibrating: boolean;
  recovery_score: number;
  resting_heart_rate: number;
  hrv_rmssd_milli: number;
  spo2_percentage?: number;
  skin_temp_celsius?: number;
}

export interface WhoopRecovery {
  cycle_id: number;
  sleep_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score: WhoopRecoveryScore;
}

// ─── Sleep ───────────────────────────────────────────────────────────────────

export interface WhoopSleepStageSummary {
  total_in_bed_time_milli: number;
  total_awake_time_milli: number;
  total_no_data_time_milli: number;
  total_light_sleep_time_milli: number;
  total_slow_wave_sleep_time_milli: number;
  total_rem_sleep_time_milli: number;
  sleep_cycle_count: number;
  disturbance_count: number;
}

export interface WhoopSleepNeeded {
  baseline_milli: number;
  need_from_sleep_debt_milli: number;
  need_from_recent_strain_milli: number;
  need_from_recent_nap_milli: number;
}

export interface WhoopSleepScore {
  stage_summary: WhoopSleepStageSummary;
  sleep_needed: WhoopSleepNeeded;
  respiratory_rate: number;
  sleep_performance_percentage: number;
  sleep_consistency_percentage: number;
  sleep_efficiency_percentage: number;
}

export interface WhoopSleep {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  nap: boolean;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score: WhoopSleepScore;
}

// ─── Workout ─────────────────────────────────────────────────────────────────

export interface WhoopWorkoutZoneDuration {
  zone_zero_milli: number;
  zone_one_milli: number;
  zone_two_milli: number;
  zone_three_milli: number;
  zone_four_milli: number;
  zone_five_milli: number;
}

export interface WhoopWorkoutScore {
  strain: number;
  average_heart_rate: number;
  max_heart_rate: number;
  kilojoule: number;
  percent_recorded: number;
  distance_meter?: number;
  altitude_gain_meter?: number;
  altitude_change_meter?: number;
  zone_duration: WhoopWorkoutZoneDuration;
}

export interface WhoopWorkout {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  sport_id: number;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score: WhoopWorkoutScore;
}

// ─── Cycle ───────────────────────────────────────────────────────────────────

export interface WhoopCycleScore {
  strain: number;
  kilojoule: number;
  average_heart_rate: number;
  max_heart_rate: number;
}

export interface WhoopCycle {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score: WhoopCycleScore;
}

// ─── Token Types ─────────────────────────────────────────────────────────────

export interface WhoopTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface WhoopStoredTokenData {
  access_token: string;
  refresh_token: string;
  expires_at: string; // ISO datetime
  scope: string;
  token_type: string;
  whoop_user_id?: number;
}

// ─── Sync Types ──────────────────────────────────────────────────────────────

export type TrafficLight = 'green' | 'yellow' | 'red';

export interface WhoopSyncSummary {
  success: boolean;
  recovery_synced: number;
  sleep_synced: number;
  workouts_synced: number;
  cycles_synced: number;
  errors: string[];
  started_at: string;
  completed_at: string;
  duration_ms: number;
}

// ─── Sport ID Mapping ────────────────────────────────────────────────────────

export const WHOOP_SPORT_MAP: Record<number, string> = {
  [-1]: 'Activity',
  0: 'Running',
  1: 'Cycling',
  2: 'Rowing',
  3: 'Pilates',
  4: 'Yoga',
  5: 'Hiking',
  6: 'Weightlifting',
  7: 'CrossFit',
  8: 'Swim',
  9: 'Baseball',
  10: 'Basketball',
  11: 'Boxing',
  12: 'Cricket',
  13: 'Field Hockey',
  14: 'Football',
  15: 'Golf',
  16: 'Ice Hockey',
  17: 'Lacrosse',
  18: 'Rugby',
  19: 'Soccer',
  20: 'Softball',
  21: 'Squash',
  22: 'Tennis',
  23: 'Volleyball',
  24: 'Water Polo',
  25: 'Wrestling',
  26: 'Dance',
  27: 'Martial Arts',
  28: 'Surfing',
  29: 'Snowboarding',
  30: 'Skiing',
  31: 'Rock Climbing',
  32: 'Kayaking',
  33: 'Rowing (on water)',
  34: 'Paddleboarding',
  35: 'Sailing',
  36: 'Duathlon',
  37: 'Triathlon',
  38: 'Obstacle Course Racing',
  39: 'Motorsport',
  40: 'Functional Fitness',
  41: 'Elliptical',
  42: 'Stairmaster',
  43: 'Meditation',
  44: 'Other',
  45: 'Gymnastics',
  46: 'HIIT',
  47: 'Spin',
  48: 'Assault Bike',
  49: 'Badminton',
  50: 'Table Tennis',
  51: 'Pickleball',
  52: 'Skateboarding',
  63: 'Barre',
  64: 'Walking',
  65: 'Jumping Rope',
  66: 'Calisthenics',
  70: 'Brazilian Jiu Jitsu',
  71: 'MMA',
  73: 'Fencing',
  74: 'Handball',
  75: 'Diving',
  76: 'Track & Field',
  77: 'Mountain Biking',
  82: 'Ultimate Frisbee',
  83: 'Stretching',
  84: 'Massage / Bodywork',
  85: 'Sauna',
  86: 'Cold Plunge',
  87: 'Breathwork',
  88: 'Foam Rolling',
};

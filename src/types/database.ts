/**
 * Database types matching the Supabase schema
 * Auto-generated from SQL migrations
 */

// ============================================================================
// ENUMS
// ============================================================================

export type TargetDomain =
  | 'body_fat'
  | 'vo2_max'
  | 'squat_1rm'
  | 'bench_1rm'
  | 'deadlift_1rm'
  | 'ohp_1rm'
  | 'row_1rm'
  | 'dead_hang'
  | 'farmer_walk'
  | 'plank'
  | 'wall_sit'
  | 'pull_ups'
  | 'balance_open'
  | 'balance_closed'
  | 'grip_strength'
  | 'mile_run'
  | 'deadlift_reps'
  | 'weight';

export type TargetStatus = 'active' | 'achieved' | 'abandoned' | 'revised';

export type SetType = 'normal' | 'warmup' | 'failure' | 'drop';

export type OneRmFormula = 'epley' | 'brzycki' | 'lombardi' | 'mayhew' | 'oconner' | 'wathan';

export type RecordType = '1rm' | 'max_weight' | 'max_reps' | 'max_volume';

export type TrafficLight = 'green' | 'yellow' | 'red';

export type IntegrationProvider = 'whoop' | 'hevy';

// ============================================================================
// PROFILES
// ============================================================================

export interface Profile {
  id: string;
  display_name: string | null;
  height_cm: number | null;
  weight_unit: 'kg' | 'lb';
  distance_unit: 'km' | 'mi';
  resting_hr: number;
  hrv_baseline: number;
  max_hr: number;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<ProfileInsert>;

// ============================================================================
// TARGETS
// ============================================================================

export interface Target {
  id: string;
  user_id: string;
  domain: TargetDomain;
  metric_name: string;
  unit: string;
  baseline: number | null;
  target_3m: number | null;
  target_6m: number | null;
  target_12m: number | null;
  current_value: number | null;
  start_date: string;
  status: TargetStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TargetInsert = Omit<Target, 'id' | 'created_at' | 'updated_at'>;
export type TargetUpdate = Partial<TargetInsert>;

// ============================================================================
// BODY COMPOSITION
// ============================================================================

export interface DailyWeight {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number;
  body_fat_pct: number | null;
  source: 'manual' | 'scale' | 'whoop' | 'import';
  notes: string | null;
  created_at: string;
}

export type DailyWeightInsert = Omit<DailyWeight, 'id' | 'created_at'>;
export type DailyWeightUpdate = Partial<DailyWeightInsert>;

export interface BodyMeasurement {
  id: string;
  user_id: string;
  date: string;
  waist_cm: number | null;
  hips_cm: number | null;
  chest_cm: number | null;
  left_arm_cm: number | null;
  right_arm_cm: number | null;
  left_thigh_cm: number | null;
  right_thigh_cm: number | null;
  notes: string | null;
  created_at: string;
}

export type BodyMeasurementInsert = Omit<BodyMeasurement, 'id' | 'created_at'>;
export type BodyMeasurementUpdate = Partial<BodyMeasurementInsert>;

export interface DexaScan {
  id: string;
  user_id: string;
  date: string;
  total_body_fat_pct: number | null;
  fat_mass_kg: number | null;
  lean_mass_kg: number | null;
  bone_density: number | null;
  visceral_fat_area: number | null;
  notes: string | null;
  created_at: string;
}

export type DexaScanInsert = Omit<DexaScan, 'id' | 'created_at'>;
export type DexaScanUpdate = Partial<DexaScanInsert>;

// ============================================================================
// HEVY WORKOUTS
// ============================================================================

export interface HevyWorkout {
  id: string;
  user_id: string;
  hevy_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  total_volume_kg: number | null;
  total_sets: number | null;
  raw_data: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export type HevyWorkoutInsert = Omit<HevyWorkout, 'id' | 'created_at' | 'updated_at'>;
export type HevyWorkoutUpdate = Partial<HevyWorkoutInsert>;

export interface ExerciseTemplate {
  id: string;
  user_id: string;
  hevy_template_id: string | null;
  title: string;
  muscle_group: string | null;
  equipment: string | null;
  is_key_lift: boolean;
  created_at: string;
}

export type ExerciseTemplateInsert = Omit<ExerciseTemplate, 'id' | 'created_at'>;
export type ExerciseTemplateUpdate = Partial<ExerciseTemplateInsert>;

export interface HevyWorkoutExercise {
  id: string;
  user_id: string;
  workout_id: string;
  hevy_exercise_id: string;
  title: string;
  exercise_index: number;
  superset_id: number | null;
  notes: string | null;
  created_at: string;
}

export type HevyWorkoutExerciseInsert = Omit<HevyWorkoutExercise, 'id' | 'created_at'>;
export type HevyWorkoutExerciseUpdate = Partial<HevyWorkoutExerciseInsert>;

export interface HevySet {
  id: string;
  user_id: string;
  exercise_id: string;
  set_index: number;
  set_type: SetType;
  weight_kg: number | null;
  reps: number | null;
  rpe: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  created_at: string;
}

export type HevySetInsert = Omit<HevySet, 'id' | 'created_at'>;
export type HevySetUpdate = Partial<HevySetInsert>;

// ============================================================================
// HEVY ANALYTICS
// ============================================================================

export interface Estimated1RM {
  id: string;
  user_id: string;
  exercise_template_id: string;
  date: string;
  estimated_1rm_kg: number;
  best_set_weight: number;
  best_set_reps: number;
  formula: OneRmFormula;
  created_at: string;
}

export type Estimated1RMInsert = Omit<Estimated1RM, 'id' | 'created_at'>;
export type Estimated1RMUpdate = Partial<Estimated1RMInsert>;

export interface WeeklyVolume {
  id: string;
  user_id: string;
  week_start: string;
  muscle_group: string;
  total_sets: number;
  total_volume_kg: number;
  created_at: string;
}

export type WeeklyVolumeInsert = Omit<WeeklyVolume, 'id' | 'created_at'>;
export type WeeklyVolumeUpdate = Partial<WeeklyVolumeInsert>;

export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_template_id: string;
  record_type: RecordType;
  value: number;
  previous_value: number | null;
  date: string;
  workout_id: string | null;
  created_at: string;
}

export type PersonalRecordInsert = Omit<PersonalRecord, 'id' | 'created_at'>;
export type PersonalRecordUpdate = Partial<PersonalRecordInsert>;

// ============================================================================
// WHOOP DATA
// ============================================================================

export interface WhoopRecovery {
  id: string;
  user_id: string;
  whoop_id: string;
  date: string;
  recovery_score: number | null;
  hrv_rmssd: number | null;
  resting_hr: number | null;
  spo2_pct: number | null;
  skin_temp_celsius: number | null;
  traffic_light: TrafficLight | null;
  raw_data: Record<string, any> | null;
  created_at: string;
}

export type WhoopRecoveryInsert = Omit<WhoopRecovery, 'id' | 'created_at'>;
export type WhoopRecoveryUpdate = Partial<WhoopRecoveryInsert>;

export interface WhoopSleep {
  id: string;
  user_id: string;
  whoop_id: string;
  date: string;
  total_duration_minutes: number | null;
  rem_minutes: number | null;
  deep_minutes: number | null;
  light_minutes: number | null;
  awake_minutes: number | null;
  sleep_performance: number | null;
  respiratory_rate: number | null;
  raw_data: Record<string, any> | null;
  created_at: string;
}

export type WhoopSleepInsert = Omit<WhoopSleep, 'id' | 'created_at'>;
export type WhoopSleepUpdate = Partial<WhoopSleepInsert>;

export interface WhoopWorkout {
  id: string;
  user_id: string;
  whoop_id: string;
  date: string;
  sport_name: string | null;
  duration_minutes: number | null;
  strain: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  kilojoules: number | null;
  zone1_minutes: number;
  zone2_minutes: number;
  zone3_minutes: number;
  zone4_minutes: number;
  zone5_minutes: number;
  raw_data: Record<string, any> | null;
  created_at: string;
}

export type WhoopWorkoutInsert = Omit<WhoopWorkout, 'id' | 'created_at'>;
export type WhoopWorkoutUpdate = Partial<WhoopWorkoutInsert>;

export interface WhoopCycle {
  id: string;
  user_id: string;
  whoop_id: string;
  date: string;
  strain: number | null;
  kilojoules: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  raw_data: Record<string, any> | null;
  created_at: string;
}

export type WhoopCycleInsert = Omit<WhoopCycle, 'id' | 'created_at'>;
export type WhoopCycleUpdate = Partial<WhoopCycleInsert>;

// ============================================================================
// INTEGRATION TOKENS
// ============================================================================

export interface IntegrationToken {
  id: string;
  user_id: string;
  provider: IntegrationProvider;
  encrypted_access_token: string;
  encrypted_refresh_token: string | null;
  iv: string;
  auth_tag: string;
  token_type: string;
  expires_at: string | null;
  scopes: string | null;
  created_at: string;
  updated_at: string;
}

export type IntegrationTokenInsert = Omit<IntegrationToken, 'id' | 'created_at' | 'updated_at'>;
export type IntegrationTokenUpdate = Partial<IntegrationTokenInsert>;

// ============================================================================
// COMPOSITE TYPES (WITH RELATIONS)
// ============================================================================

export interface HevyWorkoutWithExercises extends HevyWorkout {
  exercises: HevyWorkoutExerciseWithSets[];
}

export interface HevyWorkoutExerciseWithSets extends HevyWorkoutExercise {
  sets: HevySet[];
  template?: ExerciseTemplate;
}

export interface ExerciseTemplateWithStats extends ExerciseTemplate {
  latest_1rm?: Estimated1RM;
  personal_records?: PersonalRecord[];
}

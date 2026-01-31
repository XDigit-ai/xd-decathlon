/**
 * Application-level metric types
 * Types for aggregated metrics, dashboard data, and computed values
 */

import type { TrafficLight, TargetDomain, TargetStatus } from './database';

// ============================================================================
// CHART DATA TYPES
// ============================================================================

export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: string | number;
}

export interface TimeSeriesData {
  data: ChartDataPoint[];
  min?: number;
  max?: number;
  average?: number;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardSummary {
  recovery: RecoveryStatus;
  targets: TargetProgress[];
  recentWorkouts: WorkoutSummary[];
  domainStatus: DomainStatus[];
  streaks: StreakData;
}

export interface RecoveryStatus {
  traffic_light: TrafficLight;
  recovery_score: number | null;
  hrv: number | null;
  resting_hr: number | null;
  sleep_performance: number | null;
  date: string;
  message: string;
}

export interface TargetProgress {
  id: string;
  domain: TargetDomain;
  metric_name: string;
  unit: string;
  baseline: number | null;
  target_3m: number | null;
  target_6m: number | null;
  target_12m: number | null;
  current_value: number | null;
  status: TargetStatus;
  progress_percentage: number;
  days_elapsed: number;
  days_remaining: number;
  on_track: boolean;
  start_date: string;
}

export interface WorkoutSummary {
  id: string;
  title: string;
  date: string;
  duration_minutes: number;
  total_volume_kg: number | null;
  total_sets: number | null;
  exercises_count: number;
  key_lifts: KeyLiftSummary[];
}

export interface KeyLiftSummary {
  exercise_title: string;
  best_set_weight: number;
  best_set_reps: number;
  estimated_1rm?: number;
  is_pr: boolean;
}

export interface DomainStatus {
  domain: string;
  title: string;
  status: 'on-track' | 'attention' | 'excellent' | 'neutral';
  current_value: number | null;
  target_value: number | null;
  unit: string;
  progress_percentage: number;
  trend: 'up' | 'down' | 'stable';
  last_updated: string;
}

export interface StreakData {
  workout_streak: number;
  sleep_streak: number;
  green_recovery_streak: number;
}

// ============================================================================
// FITNESS DOMAIN TYPES
// ============================================================================

export type FitnessDomain = 'body' | 'strength' | 'cardio' | 'recovery' | 'functional';

export interface DomainMetrics {
  domain: FitnessDomain;
  metrics: MetricSummary[];
}

export interface MetricSummary {
  name: string;
  value: number | null;
  unit: string;
  change_percentage?: number;
  change_period?: '7d' | '30d' | '90d';
}

// ============================================================================
// FUNCTIONAL TESTING TYPES
// ============================================================================

export interface FunctionalBenchmark {
  test_name: string;
  category: 'strength' | 'endurance' | 'balance' | 'stability';
  current_value: number | null;
  target_value: number;
  unit: string;
  last_tested: string | null;
  baseline: number | null;
  improvement_percentage: number | null;
}

export interface FunctionalTestResult {
  test_name: string;
  value: number;
  unit: string;
  date: string;
  notes?: string;
}

// ============================================================================
// BODY COMPOSITION TYPES
// ============================================================================

export interface BodyCompositionTrend {
  weight: TimeSeriesData;
  body_fat: TimeSeriesData;
  lean_mass?: TimeSeriesData;
  measurements?: MeasurementTrends;
}

export interface MeasurementTrends {
  waist: TimeSeriesData;
  hips: TimeSeriesData;
  chest: TimeSeriesData;
  arms: TimeSeriesData;
  thighs: TimeSeriesData;
}

// ============================================================================
// VOLUME & INTENSITY TYPES
// ============================================================================

export interface VolumeAnalysis {
  weekly_totals: ChartDataPoint[];
  by_muscle_group: MuscleGroupVolume[];
  trend: 'increasing' | 'decreasing' | 'stable';
  average_weekly_sets: number;
  average_weekly_volume_kg: number;
}

export interface MuscleGroupVolume {
  muscle_group: string;
  total_sets: number;
  total_volume_kg: number;
  sessions: number;
  average_intensity: number;
}

export interface IntensityMetrics {
  average_rpe: number | null;
  sets_to_failure: number;
  total_working_sets: number;
  intensity_trend: 'up' | 'down' | 'stable';
}

// ============================================================================
// RECOVERY ANALYTICS TYPES
// ============================================================================

export interface RecoveryTrend {
  recovery_scores: TimeSeriesData;
  hrv_trend: TimeSeriesData;
  resting_hr_trend: TimeSeriesData;
  sleep_performance: TimeSeriesData;
  correlation_with_training?: number;
}

export interface RecoveryInsights {
  average_recovery: number;
  green_days: number;
  yellow_days: number;
  red_days: number;
  optimal_training_window: string;
  recovery_trend: 'improving' | 'declining' | 'stable';
}

// ============================================================================
// PERSONAL RECORDS TYPES
// ============================================================================

export interface PersonalRecordSummary {
  exercise_title: string;
  record_type: '1rm' | 'max_weight' | 'max_reps' | 'max_volume';
  current_value: number;
  previous_value: number | null;
  improvement: number;
  date: string;
  days_since_pr: number;
}

// ============================================================================
// DATE RANGE TYPES
// ============================================================================

export interface DateRange {
  start: string;
  end: string;
}

export type PredefinedRange = '7d' | '30d' | '90d' | '6m' | '1y' | 'all';

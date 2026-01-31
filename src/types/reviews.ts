/**
 * Review types
 * Types for weekly, monthly, and quarterly fitness reviews
 */

// ============================================================================
// REVIEW BASE TYPES
// ============================================================================

export type ReviewType = 'weekly' | 'monthly' | 'quarterly';

export interface Review {
  id: string;
  user_id: string;
  review_type: ReviewType;
  period_start: string;
  period_end: string;
  data: ReviewFormData;
  created_at: string;
  updated_at: string;
}

export type ReviewInsert = Omit<Review, 'id' | 'created_at' | 'updated_at'>;
export type ReviewUpdate = Partial<ReviewInsert>;

// ============================================================================
// WEEKLY REVIEW TYPES
// ============================================================================

export interface WeeklyReviewData {
  // Auto-populated metrics
  total_workouts: number;
  total_volume_kg: number;
  total_sets: number;
  average_recovery_score: number | null;
  average_sleep_hours: number | null;
  green_recovery_days: number;

  // Manual reflections
  energy_level: 1 | 2 | 3 | 4 | 5;
  stress_level: 1 | 2 | 3 | 4 | 5;
  motivation: 1 | 2 | 3 | 4 | 5;
  adherence_to_plan: number; // percentage
  highlights: string;
  challenges: string;
  injuries_or_pain: string | null;

  // Adjustments
  volume_adjustment: 'increase' | 'decrease' | 'maintain';
  intensity_adjustment: 'increase' | 'decrease' | 'maintain';
  recovery_focus_needed: boolean;

  // Next week planning
  next_week_focus: string;
  planned_deload: boolean;
}

// ============================================================================
// MONTHLY REVIEW TYPES
// ============================================================================

export interface MonthlyReviewData {
  // Strength progress
  strength_prs: {
    exercise: string;
    previous_1rm: number;
    new_1rm: number;
    improvement_percentage: number;
  }[];
  total_volume_change: number; // percentage

  // Cardio progress
  vo2_max_estimate: number | null;
  cardio_sessions_completed: number;
  longest_run_km: number | null;

  // Body composition
  weight_change_kg: number;
  body_fat_change: number | null;
  measurements_change: {
    waist: number | null;
    hips: number | null;
    chest: number | null;
    arms: number | null;
  };

  // Recovery metrics
  average_recovery_score: number | null;
  average_hrv: number | null;
  average_sleep_hours: number | null;
  red_recovery_days: number;

  // Functional assessment
  balance_test_improvement: number | null;
  stability_test_improvement: number | null;

  // Reflections
  biggest_win: string;
  biggest_challenge: string;
  lessons_learned: string;

  // Adjustments for next month
  program_changes: string;
  new_focus_areas: string[];
  targets_to_adjust: string[];
}

// ============================================================================
// QUARTERLY REVIEW TYPES
// ============================================================================

export interface QuarterlyReviewData {
  // DEXA scan comparison
  dexa_comparison: {
    previous_date: string | null;
    current_date: string;
    body_fat_change: number;
    lean_mass_change: number;
    visceral_fat_change: number | null;
  } | null;

  // Strength achievements
  major_prs: {
    lift: string;
    baseline: number;
    current: number;
    improvement_percentage: number;
  }[];
  estimated_1rm_improvements: {
    squat: number | null;
    bench: number | null;
    deadlift: number | null;
    ohp: number | null;
  };

  // Functional testing
  cooper_test_result: {
    distance_meters: number;
    vo2_max_estimate: number;
    improvement: number | null;
  } | null;
  dead_hang_duration: number | null;
  plank_duration: number | null;

  // Target progress review
  targets_achieved: string[];
  targets_on_track: string[];
  targets_needing_revision: string[];

  // Overall assessment
  overall_fitness_score: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  energy_and_vitality: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  body_confidence: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // Progress photos
  photo_urls: string[];
  photo_notes: string | null;

  // Goals and planning
  quarter_achievements: string;
  missed_opportunities: string;
  next_quarter_goals: string[];
  program_overhaul_needed: boolean;

  // Lifestyle factors
  nutrition_quality: 1 | 2 | 3 | 4 | 5;
  sleep_quality: 1 | 2 | 3 | 4 | 5;
  stress_management: 1 | 2 | 3 | 4 | 5;
  recovery_practices: string;
}

// ============================================================================
// UNION TYPE FOR ALL REVIEW DATA
// ============================================================================

export type ReviewFormData =
  | WeeklyReviewData
  | MonthlyReviewData
  | QuarterlyReviewData;

// ============================================================================
// REVIEW SUMMARY TYPES
// ============================================================================

export interface ReviewSummary {
  review_type: ReviewType;
  period_start: string;
  period_end: string;
  completed: boolean;
  key_metrics: {
    workouts?: number;
    prs?: number;
    recovery_avg?: number;
  };
  created_at?: string;
}

export interface ReviewHistory {
  weekly: ReviewSummary[];
  monthly: ReviewSummary[];
  quarterly: ReviewSummary[];
}

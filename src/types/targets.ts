/**
 * Target types
 * Types for fitness targets, goals, and progress tracking
 */

import type { TargetDomain, TargetStatus, Target } from './database';

// ============================================================================
// FITNESS DOMAIN TYPES
// ============================================================================

export type FitnessDomainCategory = 'body' | 'strength' | 'cardio' | 'recovery' | 'functional';

export interface DomainCategoryMap {
  body: TargetDomain[];
  strength: TargetDomain[];
  cardio: TargetDomain[];
  recovery: TargetDomain[];
  functional: TargetDomain[];
}

export const DOMAIN_CATEGORIES: DomainCategoryMap = {
  body: ['body_fat', 'weight'],
  strength: ['squat_1rm', 'bench_1rm', 'deadlift_1rm', 'ohp_1rm', 'row_1rm', 'deadlift_reps'],
  cardio: ['vo2_max', 'mile_run'],
  recovery: [],
  functional: [
    'dead_hang',
    'farmer_walk',
    'plank',
    'wall_sit',
    'pull_ups',
    'balance_open',
    'balance_closed',
    'grip_strength',
  ],
};

// ============================================================================
// TARGET METRIC TYPES
// ============================================================================

export type TargetMetric = {
  domain: TargetDomain;
  name: string;
  unit: string;
  category: FitnessDomainCategory;
  description: string;
  increase_is_better: boolean;
};

export const TARGET_METRICS: Record<TargetDomain, TargetMetric> = {
  body_fat: {
    domain: 'body_fat',
    name: 'Body Fat Percentage',
    unit: '%',
    category: 'body',
    description: 'Total body fat percentage',
    increase_is_better: false,
  },
  weight: {
    domain: 'weight',
    name: 'Body Weight',
    unit: 'kg',
    category: 'body',
    description: 'Total body weight',
    increase_is_better: false,
  },
  vo2_max: {
    domain: 'vo2_max',
    name: 'VO2 Max',
    unit: 'ml/kg/min',
    category: 'cardio',
    description: 'Maximal oxygen uptake capacity',
    increase_is_better: true,
  },
  squat_1rm: {
    domain: 'squat_1rm',
    name: 'Squat 1RM',
    unit: 'kg',
    category: 'strength',
    description: 'One-rep max for back squat',
    increase_is_better: true,
  },
  bench_1rm: {
    domain: 'bench_1rm',
    name: 'Bench Press 1RM',
    unit: 'kg',
    category: 'strength',
    description: 'One-rep max for bench press',
    increase_is_better: true,
  },
  deadlift_1rm: {
    domain: 'deadlift_1rm',
    name: 'Deadlift 1RM',
    unit: 'kg',
    category: 'strength',
    description: 'One-rep max for deadlift',
    increase_is_better: true,
  },
  ohp_1rm: {
    domain: 'ohp_1rm',
    name: 'Overhead Press 1RM',
    unit: 'kg',
    category: 'strength',
    description: 'One-rep max for overhead press',
    increase_is_better: true,
  },
  row_1rm: {
    domain: 'row_1rm',
    name: 'Barbell Row 1RM',
    unit: 'kg',
    category: 'strength',
    description: 'One-rep max for barbell row',
    increase_is_better: true,
  },
  dead_hang: {
    domain: 'dead_hang',
    name: 'Dead Hang Duration',
    unit: 'seconds',
    category: 'functional',
    description: 'Maximum dead hang duration',
    increase_is_better: true,
  },
  farmer_walk: {
    domain: 'farmer_walk',
    name: 'Farmer Walk Distance',
    unit: 'meters',
    category: 'functional',
    description: 'Maximum farmer walk distance with heavy load',
    increase_is_better: true,
  },
  plank: {
    domain: 'plank',
    name: 'Plank Duration',
    unit: 'seconds',
    category: 'functional',
    description: 'Maximum plank hold duration',
    increase_is_better: true,
  },
  wall_sit: {
    domain: 'wall_sit',
    name: 'Wall Sit Duration',
    unit: 'seconds',
    category: 'functional',
    description: 'Maximum wall sit duration',
    increase_is_better: true,
  },
  pull_ups: {
    domain: 'pull_ups',
    name: 'Pull-ups Max Reps',
    unit: 'reps',
    category: 'functional',
    description: 'Maximum consecutive pull-ups',
    increase_is_better: true,
  },
  balance_open: {
    domain: 'balance_open',
    name: 'Single Leg Balance (Eyes Open)',
    unit: 'seconds',
    category: 'functional',
    description: 'Single leg balance duration with eyes open',
    increase_is_better: true,
  },
  balance_closed: {
    domain: 'balance_closed',
    name: 'Single Leg Balance (Eyes Closed)',
    unit: 'seconds',
    category: 'functional',
    description: 'Single leg balance duration with eyes closed',
    increase_is_better: true,
  },
  grip_strength: {
    domain: 'grip_strength',
    name: 'Grip Strength',
    unit: 'kg',
    category: 'functional',
    description: 'Maximum grip strength (dynamometer)',
    increase_is_better: true,
  },
  mile_run: {
    domain: 'mile_run',
    name: 'Mile Run Time',
    unit: 'minutes',
    category: 'cardio',
    description: 'Best mile run time',
    increase_is_better: false,
  },
  deadlift_reps: {
    domain: 'deadlift_reps',
    name: 'Deadlift Max Reps',
    unit: 'reps',
    category: 'strength',
    description: 'Maximum deadlift reps at bodyweight',
    increase_is_better: true,
  },
};

// ============================================================================
// TARGET WITH PROGRESS TYPES
// ============================================================================

export interface TargetWithProgress extends Target {
  progress_percentage: number;
  days_elapsed: number;
  days_remaining_3m: number;
  days_remaining_6m: number;
  days_remaining_12m: number;
  on_track_3m: boolean;
  on_track_6m: boolean;
  on_track_12m: boolean;
  current_trajectory: number | null; // projected value if current rate continues
  metric_info: TargetMetric;
}

// ============================================================================
// TARGET FORM INPUT TYPES
// ============================================================================

export interface CreateTargetInput {
  domain: TargetDomain;
  baseline: number | null;
  target_3m: number | null;
  target_6m: number | null;
  target_12m: number | null;
  notes?: string;
}

export interface UpdateTargetInput {
  current_value?: number | null;
  target_3m?: number | null;
  target_6m?: number | null;
  target_12m?: number | null;
  status?: TargetStatus;
  notes?: string;
}

// ============================================================================
// TARGET VALIDATION TYPES
// ============================================================================

export interface TargetValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TargetValidationRules {
  domain: TargetDomain;
  min_value?: number;
  max_value?: number;
  realistic_monthly_change?: number; // percentage
  requires_baseline: boolean;
}

// ============================================================================
// TARGET ANALYTICS TYPES
// ============================================================================

export interface TargetAnalytics {
  total_targets: number;
  active_targets: number;
  achieved_targets: number;
  on_track_targets: number;
  needs_attention_targets: number;
  average_progress: number;
  by_category: {
    category: FitnessDomainCategory;
    count: number;
    avg_progress: number;
  }[];
}

export interface TargetTrend {
  target_id: string;
  data_points: {
    date: string;
    value: number;
    target_value: number;
  }[];
  trend: 'improving' | 'declining' | 'stable';
  velocity: number; // rate of change per month
}

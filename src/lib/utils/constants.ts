/**
 * Application-wide constants for the Decathlon project.
 *
 * Includes functional benchmarks, heart rate zones, muscle groups,
 * chart colors, and domain categorization.
 */

/**
 * Functional fitness benchmarks based on industry standards.
 */
export interface FunctionalBenchmark {
  testType: string;
  label: string;
  target: number;
  unit: string;
  frequency: 'weekly' | 'monthly' | 'quarterly';
  category: 'strength' | 'cardio' | 'mobility' | 'balance';
  description?: string;
}

export const FUNCTIONAL_BENCHMARKS: FunctionalBenchmark[] = [
  {
    testType: 'pushups_60s',
    label: 'Push-ups (60s)',
    target: 40,
    unit: 'reps',
    frequency: 'monthly',
    category: 'strength',
    description: 'Maximum push-ups in 60 seconds with proper form',
  },
  {
    testType: 'situps_60s',
    label: 'Sit-ups (60s)',
    target: 50,
    unit: 'reps',
    frequency: 'monthly',
    category: 'strength',
    description: 'Maximum sit-ups in 60 seconds',
  },
  {
    testType: 'pullups_max',
    label: 'Pull-ups (Max)',
    target: 15,
    unit: 'reps',
    frequency: 'monthly',
    category: 'strength',
    description: 'Maximum consecutive pull-ups',
  },
  {
    testType: 'mile_run',
    label: 'Mile Run',
    target: 450, // 7:30 in seconds
    unit: 'seconds',
    frequency: 'monthly',
    category: 'cardio',
    description: 'Fastest mile time',
  },
  {
    testType: 'plank_hold',
    label: 'Plank Hold',
    target: 120,
    unit: 'seconds',
    frequency: 'monthly',
    category: 'strength',
    description: 'Maximum plank hold time',
  },
  {
    testType: 'single_leg_balance',
    label: 'Single Leg Balance',
    target: 60,
    unit: 'seconds',
    frequency: 'quarterly',
    category: 'balance',
    description: 'Balance on one leg with eyes closed',
  },
  {
    testType: 'sit_and_reach',
    label: 'Sit and Reach',
    target: 10,
    unit: 'inches',
    frequency: 'quarterly',
    category: 'mobility',
    description: 'Hamstring and lower back flexibility',
  },
  {
    testType: 'vertical_jump',
    label: 'Vertical Jump',
    target: 24,
    unit: 'inches',
    frequency: 'monthly',
    category: 'strength',
    description: 'Maximum vertical jump height',
  },
];

/**
 * Heart rate training zones based on max heart rate.
 */
export interface HeartRateZone {
  zone: number;
  name: string;
  minPercentage: number;
  maxPercentage: number;
  description: string;
  color: string;
}

/**
 * Calculates heart rate zones based on resting and max heart rate.
 *
 * @param {number} restingHR - Resting heart rate (default: 56)
 * @param {number} maxHR - Maximum heart rate (default: 178)
 * @returns {HeartRateZone[]} Array of heart rate zones
 */
export function calculateHRZones(restingHR: number = 56, maxHR: number = 178): HeartRateZone[] {
  const zones: HeartRateZone[] = [
    {
      zone: 1,
      name: 'Recovery',
      minPercentage: 50,
      maxPercentage: 60,
      description: 'Very light activity, active recovery',
      color: '#10b981', // green-500
    },
    {
      zone: 2,
      name: 'Aerobic',
      minPercentage: 60,
      maxPercentage: 70,
      description: 'Build aerobic base, fat burning',
      color: '#3b82f6', // blue-500
    },
    {
      zone: 3,
      name: 'Tempo',
      minPercentage: 70,
      maxPercentage: 80,
      description: 'Moderate effort, improve efficiency',
      color: '#f59e0b', // amber-500
    },
    {
      zone: 4,
      name: 'Threshold',
      minPercentage: 80,
      maxPercentage: 90,
      description: 'Hard effort, lactate threshold training',
      color: '#ef4444', // red-500
    },
    {
      zone: 5,
      name: 'Max Effort',
      minPercentage: 90,
      maxPercentage: 100,
      description: 'Maximum intensity, anaerobic training',
      color: '#dc2626', // red-600
    },
  ];

  // Calculate actual BPM ranges using Karvonen formula: ((maxHR - restingHR) × %Intensity) + restingHR
  const hrReserve = maxHR - restingHR;

  return zones.map((zone) => ({
    ...zone,
    minBPM: Math.round((hrReserve * zone.minPercentage) / 100 + restingHR),
    maxBPM: Math.round((hrReserve * zone.maxPercentage) / 100 + restingHR),
  })) as HeartRateZone[];
}

/**
 * Default heart rate zones (RHR: 56, Max HR: 178).
 */
export const HR_ZONES = calculateHRZones();

/**
 * Muscle groups for volume tracking and exercise categorization.
 */
export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'core',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'full-body',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

/**
 * Muscle group display names.
 */
export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  core: 'Core',
  quadriceps: 'Quadriceps',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  'full-body': 'Full Body',
};

/**
 * Chart color palette for data visualization.
 */
export const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
] as const;

/**
 * Fitness domains for categorizing metrics and activities.
 */
export const FITNESS_DOMAINS = [
  'body',
  'strength',
  'cardio',
  'recovery',
  'functional',
] as const;

export type FitnessDomain = (typeof FITNESS_DOMAINS)[number];

/**
 * Fitness domain display information.
 */
export interface DomainInfo {
  label: string;
  description: string;
  color: string;
  icon: string;
}

export const DOMAIN_INFO: Record<FitnessDomain, DomainInfo> = {
  body: {
    label: 'Body Composition',
    description: 'Weight, body fat, measurements',
    color: '#3b82f6',
    icon: 'scale',
  },
  strength: {
    label: 'Strength Training',
    description: 'Resistance training, 1RM, volume',
    color: '#ef4444',
    icon: 'dumbbell',
  },
  cardio: {
    label: 'Cardiovascular',
    description: 'Running, cycling, heart rate',
    color: '#10b981',
    icon: 'heart',
  },
  recovery: {
    label: 'Recovery & Sleep',
    description: 'HRV, resting heart rate, sleep quality',
    color: '#8b5cf6',
    icon: 'moon',
  },
  functional: {
    label: 'Functional Fitness',
    description: 'Real-world movement capabilities',
    color: '#f59e0b',
    icon: 'activity',
  },
};

/**
 * Default user preferences.
 */
export const DEFAULT_PREFERENCES = {
  weightUnit: 'lbs' as const,
  distanceUnit: 'miles' as const,
  weekStartsOn: 1 as const, // Monday
  theme: 'system' as const,
  notificationsEnabled: true,
};

/**
 * Volume landmarks for muscle groups (per week).
 */
export interface VolumeLandmark {
  min: number;
  optimal: number;
  max: number;
  unit: 'sets';
}

export const VOLUME_LANDMARKS: Record<string, VolumeLandmark> = {
  chest: { min: 10, optimal: 16, max: 22, unit: 'sets' },
  back: { min: 12, optimal: 18, max: 25, unit: 'sets' },
  shoulders: { min: 8, optimal: 12, max: 18, unit: 'sets' },
  biceps: { min: 6, optimal: 10, max: 14, unit: 'sets' },
  triceps: { min: 6, optimal: 10, max: 14, unit: 'sets' },
  quadriceps: { min: 10, optimal: 15, max: 20, unit: 'sets' },
  hamstrings: { min: 8, optimal: 12, max: 16, unit: 'sets' },
  glutes: { min: 8, optimal: 12, max: 16, unit: 'sets' },
  calves: { min: 8, optimal: 12, max: 16, unit: 'sets' },
  core: { min: 6, optimal: 10, max: 15, unit: 'sets' },
};

/**
 * Recovery status thresholds.
 */
export const RECOVERY_THRESHOLDS = {
  green: 95, // > 95% of baseline
  yellow: 90, // 90-95% of baseline
  red: 0, // < 90% of baseline
} as const;

/**
 * Date range presets for filtering data.
 */
export const DATE_RANGE_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 6 months', days: 180 },
  { label: 'Last year', days: 365 },
] as const;

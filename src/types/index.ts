// Domain types

export interface RecoveryStatus {
  status: "green" | "yellow" | "red";
  label: string;
  recommendation: string;
  hrv: number;
  rhr: number;
  recoveryScore: number;
}

export interface WeeklySnapshot {
  sessionsCompleted: number;
  sessionsPlanned: number;
  weightTrend: number;
  avgHrv: number;
  avgSleep: number;
}

export interface DomainStatus {
  domain: "body" | "strength" | "cardio" | "recovery" | "functional";
  label: string;
  mainMetric: {
    label: string;
    value: string;
    unit: string;
  };
  trend: number[];
  status: "on-track" | "behind" | "ahead";
}

export interface ProgressTarget {
  id: string;
  domain: string;
  metricName: string;
  current: number;
  target: number;
  baseline: number;
  unit: string;
  percentage: number;
  isLowerBetter: boolean;
}

export interface RecentWorkout {
  id: string;
  title: string;
  date: string;
  volume: number;
  sets: number;
  hasPR: boolean;
}

export interface KeyLift {
  name: string;
  current1RM: number;
  target1RM: number;
  trend: { date: string; value: number }[];
}

export interface MuscleGroupVolume {
  muscleGroup: string;
  sets: number;
  color: string;
}

// Peter Attia Functional Fitness Benchmarks
export interface FunctionalBenchmark {
  testType: string;
  displayName: string;
  target: number;
  unit: string;
  hasSides: boolean;
  category: "grip" | "endurance" | "balance" | "strength" | "mobility";
}

export const FUNCTIONAL_BENCHMARKS: FunctionalBenchmark[] = [
  { testType: "dead_hang", displayName: "Dead Hang", target: 120, unit: "seconds", hasSides: false, category: "grip" },
  { testType: "farmer_walk", displayName: "Farmer's Walk (BW)", target: 120, unit: "seconds", hasSides: false, category: "grip" },
  { testType: "plank", displayName: "Plank", target: 60, unit: "seconds", hasSides: false, category: "endurance" },
  { testType: "wall_sit", displayName: "Wall Sit", target: 120, unit: "seconds", hasSides: false, category: "endurance" },
  { testType: "pull_ups", displayName: "Pull-Ups (strict)", target: 10, unit: "reps", hasSides: false, category: "strength" },
  { testType: "balance_eyes_open", displayName: "Single-Leg Balance (Eyes Open)", target: 60, unit: "seconds", hasSides: true, category: "balance" },
  { testType: "balance_eyes_closed", displayName: "Single-Leg Balance (Eyes Closed)", target: 12, unit: "seconds", hasSides: true, category: "balance" },
  { testType: "floor_getup", displayName: "Floor Get-Up", target: 1, unit: "arms", hasSides: false, category: "mobility" },
  { testType: "deadlift_reps", displayName: "Deadlift (BW x 10)", target: 10, unit: "reps", hasSides: false, category: "strength" },
  { testType: "grip_strength", displayName: "Grip Strength", target: 55, unit: "kg", hasSides: true, category: "grip" },
  { testType: "one_mile_run", displayName: "1-Mile Run", target: 7.5, unit: "minutes", hasSides: false, category: "endurance" },
  { testType: "vo2_max", displayName: "VO2 Max", target: 50, unit: "mL/kg/min", hasSides: false, category: "endurance" },
];

// Heart Rate Zones (based on user profile: RHR 56, Max 178)
export interface HRZone {
  zone: number;
  name: string;
  minPercent: number;
  maxPercent: number;
  minHR: number;
  maxHR: number;
  color: string;
}

export function calculateHRZones(rhr: number, maxHr: number): HRZone[] {
  const reserve = maxHr - rhr;

  const zones = [
    { zone: 1, name: "Recovery", minPercent: 50, maxPercent: 60, color: "#94a3b8" },
    { zone: 2, name: "Aerobic Base", minPercent: 60, maxPercent: 70, color: "#22c55e" },
    { zone: 3, name: "Tempo", minPercent: 70, maxPercent: 80, color: "#eab308" },
    { zone: 4, name: "Threshold", minPercent: 80, maxPercent: 90, color: "#f97316" },
    { zone: 5, name: "VO2 Max", minPercent: 90, maxPercent: 100, color: "#ef4444" },
  ];

  return zones.map(z => ({
    ...z,
    minHR: Math.round(rhr + reserve * (z.minPercent / 100)),
    maxHR: Math.round(rhr + reserve * (z.maxPercent / 100)),
  }));
}

// Training schedule
export interface TrainingDay {
  day: string;
  type: "strength" | "cardio" | "rest" | "active_recovery";
  title: string;
  description: string;
  exercises?: {
    name: string;
    sets: number;
    reps: string;
    rir: number;
  }[];
}

export const WEEKLY_TRAINING_SCHEDULE: TrainingDay[] = [
  {
    day: "Monday",
    type: "strength",
    title: "Upper Body Push",
    description: "Chest, shoulders, triceps focus",
    exercises: [
      { name: "Bench Press", sets: 4, reps: "6-8", rir: 2 },
      { name: "Overhead Press", sets: 4, reps: "8-10", rir: 2 },
      { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rir: 2 },
      { name: "Lateral Raises", sets: 3, reps: "12-15", rir: 1 },
      { name: "Tricep Pushdowns", sets: 3, reps: "12-15", rir: 1 },
    ],
  },
  {
    day: "Tuesday",
    type: "cardio",
    title: "Zone 2 Cardio",
    description: "45-60 min steady state (129-141 bpm)",
  },
  {
    day: "Wednesday",
    type: "strength",
    title: "Lower Body",
    description: "Quads, hamstrings, glutes focus",
    exercises: [
      { name: "Barbell Squat", sets: 4, reps: "6-8", rir: 2 },
      { name: "Romanian Deadlift", sets: 4, reps: "8-10", rir: 2 },
      { name: "Leg Press", sets: 3, reps: "10-12", rir: 2 },
      { name: "Walking Lunges", sets: 3, reps: "12 each", rir: 2 },
      { name: "Calf Raises", sets: 4, reps: "12-15", rir: 1 },
    ],
  },
  {
    day: "Thursday",
    type: "active_recovery",
    title: "Mobility & Core",
    description: "Stretching, foam rolling, light movement",
  },
  {
    day: "Friday",
    type: "strength",
    title: "Upper Body Pull",
    description: "Back, biceps, rear delts focus",
    exercises: [
      { name: "Deadlift", sets: 4, reps: "5-6", rir: 2 },
      { name: "Barbell Row", sets: 4, reps: "8-10", rir: 2 },
      { name: "Pull-Ups", sets: 3, reps: "AMRAP", rir: 1 },
      { name: "Face Pulls", sets: 3, reps: "15-20", rir: 1 },
      { name: "Barbell Curls", sets: 3, reps: "10-12", rir: 2 },
    ],
  },
  {
    day: "Saturday",
    type: "cardio",
    title: "HIIT - Norwegian 4x4",
    description: "4x4 min intervals at 85-95% max HR (151-169 bpm)",
  },
  {
    day: "Sunday",
    type: "rest",
    title: "Rest Day",
    description: "Recovery, weekly review",
  },
];

// Review types
export interface WeeklyReviewData {
  periodStart: string;
  periodEnd: string;

  // Auto-populated
  startWeight: number | null;
  endWeight: number | null;
  avgWeight: number | null;
  sessionsCompleted: number;
  sessionsPlanned: number;
  totalVolume: number;
  avgHrv: number | null;
  avgSleep: number | null;
  avgRecovery: number | null;
  cardioMinutes: number;

  // Manual
  overallRpe: number | null;
  nutritionCompliance: number | null;
  proteinTarget: boolean;
  wins: string;
  challenges: string;
  focusNextWeek: string;
  notes: string;
}

export interface MonthlyReviewData {
  periodStart: string;
  periodEnd: string;

  // Auto-populated
  strengthProgress: {
    exercise: string;
    startE1RM: number;
    endE1RM: number;
    change: number;
  }[];
  bodyComposition: {
    startWeight: number;
    endWeight: number;
    avgBodyFat: number | null;
  };
  cardioProgress: {
    vo2max: number | null;
    avgZone2Duration: number;
    hiitCompliance: number;
  };
  recoveryTrend: {
    avgHrv: number;
    avgRecovery: number;
    redDays: number;
  };

  // Manual
  programAssessment: "excellent" | "good" | "fair" | "poor";
  stabilityCheck: boolean;
  injuryConcerns: string;
  actionItems: string[];
  notes: string;
}

export interface QuarterlyReviewData {
  periodStart: string;
  periodEnd: string;

  // Checklist items
  dexaScan: { completed: boolean; date: string | null; results: string };
  cooperTest: { completed: boolean; date: string | null; distance: number | null };
  strengthTesting: { completed: boolean; date: string | null; notes: string };
  fmsTesting: { completed: boolean; date: string | null; score: number | null };
  progressPhotos: { completed: boolean; date: string | null };
  bloodWork: { completed: boolean; date: string | null; notes: string };

  // Goal status
  goalStatus: {
    domain: string;
    target: string;
    status: "on-track" | "behind" | "achieved";
    notes: string;
  }[];

  // Planning
  nextQuarterFocus: string[];
  programChanges: string;
  notes: string;
}

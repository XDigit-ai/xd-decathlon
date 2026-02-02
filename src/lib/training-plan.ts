export interface Exercise {
  name: string;
  sets: string;
  rir: string;
  rest: string;
  notes?: string;
}

export interface WarmUp {
  name: string;
  prescription: string;
}

export interface TrainingDay {
  dayIndex: number; // 0=Monday...6=Sunday
  label: string;
  title: string;
  type: 'strength' | 'hiit' | 'zone2' | 'recovery';
  duration: string;
  warmUp: WarmUp[];
  exercises: Exercise[];
  notes?: string;
}

export const TRAINING_PLAN: TrainingDay[] = [
  // Monday — Lower Body (Strength Focus)
  {
    dayIndex: 0,
    label: 'Monday',
    title: 'Lower Body — Strength Focus',
    type: 'strength',
    duration: '60-70 min',
    warmUp: [
      { name: 'Lateral band walks', prescription: '2 x 12 per direction' },
      { name: '90/90 hip rotations', prescription: '1 x 8 per side' },
      { name: 'Goblet squat hold', prescription: '2 x 15 sec' },
      { name: 'Glute bridge', prescription: '2 x 10' },
    ],
    exercises: [
      { name: 'Barbell Back Squat', sets: '4 x 4-6', rir: '2-3', rest: '3-4 min' },
      { name: 'Romanian Deadlift', sets: '4 x 4-6', rir: '2-3', rest: '3-4 min' },
      { name: 'Bulgarian Split Squat', sets: '3 x 6-8', rir: '2', rest: '2-3 min', notes: 'each leg' },
      { name: 'Leg Curl', sets: '3 x 8-10', rir: '1-2', rest: '90 sec' },
      { name: 'Standing Calf Raise', sets: '3 x 10-12', rir: '1-2', rest: '90 sec' },
      { name: 'Ab Wheel Rollout (or Plank)', sets: '3 x 8-12 (or 30-60s)', rir: '—', rest: '60 sec' },
    ],
  },
  // Tuesday — Upper Body (Strength Focus)
  {
    dayIndex: 1,
    label: 'Tuesday',
    title: 'Upper Body — Strength Focus',
    type: 'strength',
    duration: '60-70 min',
    warmUp: [
      { name: 'Banded pull-aparts', prescription: '2 x 15' },
      { name: 'Banded external rotations', prescription: '2 x 15 per arm' },
      { name: 'Push-up plus (serratus activation)', prescription: '1 x 10' },
      { name: 'Dead bug', prescription: '1 x 8 per side' },
    ],
    exercises: [
      { name: 'Barbell Bench Press', sets: '4 x 4-6', rir: '2-3', rest: '3-4 min' },
      { name: 'Barbell Row (Pendlay or Bent-Over)', sets: '4 x 4-6', rir: '2-3', rest: '3-4 min' },
      { name: 'Dumbbell Overhead Press', sets: '3 x 6-8', rir: '2', rest: '2-3 min' },
      { name: 'Weighted Chin-ups (or Lat Pulldown)', sets: '3 x 6-8', rir: '2', rest: '2-3 min' },
      { name: 'Dumbbell Curl', sets: '2 x 10-12', rir: '1-2', rest: '90 sec', notes: 'superset with 5b' },
      { name: 'Triceps Pushdown', sets: '2 x 10-12', rir: '1-2', rest: '90 sec', notes: 'superset with 5a' },
      { name: 'Pallof Press (anti-rotation core)', sets: '2 x 10 per side', rir: '—', rest: '60 sec' },
    ],
  },
  // Wednesday — Lower Body (Hypertrophy Focus)
  {
    dayIndex: 2,
    label: 'Wednesday',
    title: 'Lower Body — Hypertrophy Focus',
    type: 'strength',
    duration: '55-65 min',
    warmUp: [
      { name: 'Clamshells (banded)', prescription: '2 x 15' },
      { name: 'Fire hydrants', prescription: '1 x 10 per side' },
      { name: 'Single-leg glute bridge', prescription: '2 x 8 per side' },
      { name: 'Ankle circles', prescription: '1 x 10 per direction' },
    ],
    exercises: [
      { name: 'Leg Press', sets: '4 x 8-12', rir: '1-2', rest: '2 min' },
      { name: 'Trap Bar Deadlift (or Hip Thrust)', sets: '4 x 8-12', rir: '1-2', rest: '2 min' },
      { name: 'Walking Lunge', sets: '3 x 10-12', rir: '1-2', rest: '90 sec', notes: 'each leg' },
      { name: 'Leg Curl (lying or seated)', sets: '3 x 10-15', rir: '0-1', rest: '90 sec' },
      { name: 'Leg Extension', sets: '3 x 12-15', rir: '0-1', rest: '90 sec' },
      { name: 'Seated Calf Raise', sets: '3 x 12-15', rir: '1', rest: '60 sec' },
      { name: 'Hanging Leg Raise (or Cable Crunch)', sets: '3 x 12-15', rir: '—', rest: '60 sec' },
    ],
  },
  // Thursday — HIIT Cardio (Norwegian 4x4)
  {
    dayIndex: 3,
    label: 'Thursday',
    title: 'HIIT Cardio — Norwegian 4×4',
    type: 'hiit',
    duration: '~43 min',
    warmUp: [],
    exercises: [],
    notes: [
      'Warm-up: 10 min at Zone 1-2 (117-141 bpm)',
      'Interval 1: 4 min at Zone 5 (151-169 bpm)',
      'Recovery 1: 3 min at Zone 1-2 (117-141 bpm)',
      'Interval 2: 4 min at Zone 5 (151-169 bpm)',
      'Recovery 2: 3 min at Zone 1-2 (117-141 bpm)',
      'Interval 3: 4 min at Zone 5 (151-169 bpm)',
      'Recovery 3: 3 min at Zone 1-2 (117-141 bpm)',
      'Interval 4: 4 min at Zone 5 (151-169 bpm)',
      'Cooldown: 5 min at Zone 1 (< 117 bpm)',
      '',
      'Modality: Running, cycling, rowing, or elliptical.',
    ].join('\n'),
  },
  // Friday — Upper Body (Hypertrophy Focus)
  {
    dayIndex: 4,
    label: 'Friday',
    title: 'Upper Body — Hypertrophy Focus',
    type: 'strength',
    duration: '55-65 min',
    warmUp: [
      { name: 'Face pulls', prescription: '2 x 15' },
      { name: 'Banded pull-aparts', prescription: '2 x 15' },
      { name: 'Prone Y-T-W raises', prescription: '1 x 8 each position' },
      { name: 'Thoracic spine rotations', prescription: '1 x 8 per side' },
    ],
    exercises: [
      { name: 'Incline Dumbbell Bench Press', sets: '4 x 8-12', rir: '1-2', rest: '2 min' },
      { name: 'Cable Row (or Dumbbell Row)', sets: '4 x 8-12', rir: '1-2', rest: '2 min' },
      { name: 'Lateral Raise', sets: '3 x 12-15', rir: '0-1', rest: '60-90 sec' },
      { name: 'Lat Pulldown (wide grip)', sets: '3 x 10-12', rir: '1-2', rest: '90 sec' },
      { name: 'Face Pull', sets: '3 x 15-20', rir: '0-1', rest: '60 sec' },
      { name: 'Incline Dumbbell Curl', sets: '3 x 10-15', rir: '0-1', rest: '60 sec', notes: 'superset with 6b' },
      { name: 'Overhead Triceps Extension', sets: '3 x 10-15', rir: '0-1', rest: '60 sec', notes: 'superset with 6a' },
      { name: 'Side Plank', sets: '2 x 20-30s per side', rir: '—', rest: '60 sec' },
    ],
  },
  // Saturday — Zone 2 Cardio
  {
    dayIndex: 5,
    label: 'Saturday',
    title: 'Zone 2 Cardio — Cycling',
    type: 'zone2',
    duration: '60-90 min',
    warmUp: [],
    exercises: [],
    notes: [
      'Heart Rate: 129-141 bpm (Zone 2)',
      'Talk Test: Should be able to speak in full sentences',
      'Primary modality: Cycling (weekend rides)',
      'Alternatives: Running, rowing, swimming, brisk uphill walk',
      '',
      'Stay in Zone 2 to build mitochondrial density, capillary density, stroke volume, and fat oxidation.',
    ].join('\n'),
  },
  // Sunday — Active Recovery & Mobility
  {
    dayIndex: 6,
    label: 'Sunday',
    title: 'Active Recovery & Mobility',
    type: 'recovery',
    duration: '20-30 min',
    warmUp: [],
    exercises: [
      { name: 'Light walking or easy cycling', sets: '10-15 min', rir: '—', rest: '—' },
      { name: 'Hip 90/90 transitions', sets: '2 x 8 per side', rir: '—', rest: '—' },
      { name: 'Cat-cow', sets: '1 x 10', rir: '—', rest: '—' },
      { name: "World's greatest stretch", sets: '1 x 5 per side', rir: '—', rest: '—' },
      { name: 'Pigeon stretch', sets: '1 x 30s per side', rir: '—', rest: '—' },
      { name: 'Thoracic spine rotations', sets: '1 x 8 per side', rir: '—', rest: '—' },
      { name: 'Shoulder wall slides', sets: '1 x 10', rir: '—', rest: '—' },
      { name: 'Single-leg balance (eyes closed)', sets: '3 x max time per side', rir: '—', rest: '—' },
    ],
    notes: 'Foam rolling as desired: quads, IT band, glutes, thoracic spine, lats.',
  },
];

/** Returns the training day for today (based on local day of week). */
export function getTodaysPlan(): TrainingDay {
  // JS getDay(): 0=Sunday, 1=Monday...6=Saturday
  // Our dayIndex: 0=Monday...6=Sunday
  const jsDay = new Date().getDay();
  const dayIndex = jsDay === 0 ? 6 : jsDay - 1;
  return TRAINING_PLAN[dayIndex];
}

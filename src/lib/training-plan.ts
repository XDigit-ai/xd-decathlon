export type Phase = 1 | 2;
export type DayLabel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'rest';

export interface Exercise {
  name: string;
  sets: string;
  notes?: string;
}

export interface WarmUp {
  name: string;
  prescription: string;
}

export interface HrZoneTarget {
  zone: number;
  targetMinutes: number;
  bpmRange: string;
}

export interface TrainingDay {
  dayIndex: number; // 0=Monday...6=Sunday
  dayLabel: DayLabel;
  phase: Phase;
  label: string;
  title: string;
  type: 'strength' | 'hiit' | 'cardio' | 'mobility' | 'rest';
  duration: string;
  warmUp: WarmUp[];
  exercises: Exercise[];
  notes?: string;
  hrZones?: HrZoneTarget[];
  modality?: string[];
}

// ============================================================================
// PHASE 1: Weeks 1-6 (Tendon Armor + Base Strength)
// ============================================================================

export const PHASE_1_PLAN: TrainingDay[] = [
  // Monday — Day A: Lower + Carry + Calves
  {
    dayIndex: 0,
    dayLabel: 'A',
    phase: 1,
    label: 'Monday',
    title: 'Day A — Lower + Carry + Calves',
    type: 'strength',
    duration: '55-65 min',
    warmUp: [],
    exercises: [
      {
        name: 'Pendulum Squat',
        sets: '4×6-10',
        notes: '3 sec eccentric. Add 2.5 kg when you hit top of rep range across all sets for two consecutive sessions.'
      },
      {
        name: 'Romanian Deadlift',
        sets: '3×8',
        notes: 'Add 2.5 kg when you hit top of rep range across all sets for two consecutive sessions.'
      },
      {
        name: 'Split Squat',
        sets: '3×8/leg',
        notes: 'Controlled tempo, keep torso upright.'
      },
      {
        name: 'Farmer Carry',
        sets: '4×40 sec',
        notes: 'Build to 60 sec over Phase 1. Prioritize grip endurance and posture.'
      },
      {
        name: 'Standing Calf Raise',
        sets: '3×15',
        notes: '3 sec concentric / 3 sec eccentric. Achilles tendon conditioning.'
      },
      {
        name: 'Plank',
        sets: '3×60 sec',
        notes: 'Build to 90 sec over Phase 1. Target: 2:30 by Week 12.'
      }
    ],
    notes: 'No grinding reps — keep ~2 reps in reserve. If pain persists >48h, reduce volume by 30% next week.'
  },

  // Tuesday — Rest / Active Recovery
  {
    dayIndex: 1,
    dayLabel: 'rest',
    phase: 1,
    label: 'Tuesday',
    title: 'Rest Day',
    type: 'rest',
    duration: '—',
    warmUp: [],
    exercises: [],
    notes: 'Optional: light mobility work, walking, or complete rest.'
  },

  // Wednesday — Day B: Upper Push/Pull + Arms (Tendon-Safe)
  {
    dayIndex: 2,
    dayLabel: 'B',
    phase: 1,
    label: 'Wednesday',
    title: 'Day B — Upper Push/Pull + Arms',
    type: 'strength',
    duration: '60-70 min',
    warmUp: [
      { name: 'Band face pulls', prescription: '×20' },
      { name: 'Scap pull-ups', prescription: '×8' },
      { name: 'Wrist extensor band work', prescription: '×15' }
    ],
    exercises: [
      {
        name: 'Pull-ups (submaximal)',
        sets: 'Weeks 1-2: 5×3 | Weeks 3-4: 5×4 | Weeks 5-6: 4×5',
        notes: 'Strict form, ~2 RIR. Pulling volume increases slowly (10-15% max/week).'
      },
      {
        name: 'Eccentric Pull-ups',
        sets: '2×3',
        notes: '6 sec lowering. Stop immediately if elbow pain >3/10.'
      },
      {
        name: 'DB Bench Press',
        sets: '4×6-10',
        notes: 'Add 2 kg (per dumbbell) when you complete all sets at top of rep range for two sessions in a row.'
      },
      {
        name: 'Cable Pushdown or Overhead Tricep Extension',
        sets: '2×12-15',
        notes: 'Controlled tempo, no grinding.'
      },
      {
        name: 'One-arm Row (neutral grip)',
        sets: '3×10',
        notes: 'Add 2 kg (per dumbbell) when you complete all sets at top of rep range for two sessions. Prioritize controlled tempo.'
      },
      {
        name: 'External Rotations (band)',
        sets: '2×15',
        notes: 'Shoulder health and tendon prehab.'
      },
      {
        name: 'Slow Hammer Curl',
        sets: '2×12',
        notes: '3 sec up / 3 sec down. Tendon medicine for brachioradialis. Stay light, never grind.'
      },
      {
        name: 'Reverse Curl (EZ bar or DB)',
        sets: '2×12',
        notes: 'Targets wrist extensors and forearm in rehab-friendly range.'
      }
    ],
    notes: 'Dips NOT included in Phase 1. Will be added in Phase 2 only if elbow pain consistently ≤2/10 for 2+ weeks.'
  },

  // Thursday — Day E: Norwegian 4×4 HIIT
  {
    dayIndex: 3,
    dayLabel: 'E',
    phase: 1,
    label: 'Thursday',
    title: 'Day E — Norwegian 4×4 HIIT',
    type: 'hiit',
    duration: '~43 min',
    warmUp: [],
    hrZones: [
      { zone: 5, targetMinutes: 16, bpmRange: '151-169' },
      { zone: 2, targetMinutes: 9, bpmRange: '117-141' },
      { zone: 1, targetMinutes: 15, bpmRange: '<117' }
    ],
    modality: ['running', 'cycling', 'rowing', 'elliptical'],
    exercises: [
      {
        name: 'Warm-up',
        sets: '10 min',
        notes: 'Zone 1-2 (117-141 bpm). Easy pace to elevate heart rate gradually.'
      },
      {
        name: 'Interval 1',
        sets: '4 min',
        notes: 'Zone 5 (151-169 bpm). Hard effort — should be difficult to speak.'
      },
      {
        name: 'Recovery 1',
        sets: '3 min',
        notes: 'Zone 1-2 (117-141 bpm). Active recovery, keep moving.'
      },
      {
        name: 'Interval 2',
        sets: '4 min',
        notes: 'Zone 5 (151-169 bpm). Hard effort — should be difficult to speak.'
      },
      {
        name: 'Recovery 2',
        sets: '3 min',
        notes: 'Zone 1-2 (117-141 bpm). Active recovery, keep moving.'
      },
      {
        name: 'Interval 3',
        sets: '4 min',
        notes: 'Zone 5 (151-169 bpm). Hard effort — should be difficult to speak.'
      },
      {
        name: 'Recovery 3',
        sets: '3 min',
        notes: 'Zone 1-2 (117-141 bpm). Active recovery, keep moving.'
      },
      {
        name: 'Interval 4',
        sets: '4 min',
        notes: 'Zone 5 (151-169 bpm). Hard effort — should be difficult to speak.'
      },
      {
        name: 'Cooldown',
        sets: '5 min',
        notes: 'Zone 1 (<117 bpm). Gradually bring heart rate down.'
      }
    ],
    notes: 'Norwegian 4×4 protocol: 4 intervals of 4 min at Zone 5 with 3 min active recovery. Choose any cardio modality — running, cycling, rowing, or elliptical.'
  },

  // Friday — Day C: Full Body + Chest + Hang Exposure
  {
    dayIndex: 4,
    dayLabel: 'C',
    phase: 1,
    label: 'Friday',
    title: 'Day C — Full Body + Chest + Hang',
    type: 'strength',
    duration: '55-65 min',
    warmUp: [],
    exercises: [
      {
        name: 'Deadlift (moderate)',
        sets: '3×5',
        notes: 'Add 2.5 kg when all sets feel controlled with 2 RIR. No grinding — this is sub-maximal work.'
      },
      {
        name: 'Overhead Press (DB)',
        sets: '3-4×6-8',
        notes: 'Add 1-2 kg per dumbbell using two-session rule from Day B accessories.'
      },
      {
        name: 'Incline Push-up or Cable Fly',
        sets: '3×10-12',
        notes: 'Second weekly chest stimulus; zero elbow tendon load.'
      },
      {
        name: 'Step-ups',
        sets: '3×10/leg',
        notes: 'Single-leg strength and balance.'
      },
      {
        name: 'Dead Bug',
        sets: '3×10-12/side',
        notes: 'Core anti-extension work. Grip-safe default.'
      },
      {
        name: 'Pallof Press',
        sets: '3×12/side',
        notes: 'Anti-rotation core stability.'
      },
      {
        name: 'Side Plank',
        sets: '2×45 sec',
        notes: 'Core lateral stability.'
      },
      {
        name: 'Hang Practice',
        sets: '2-3 rounds × 20-45 sec',
        notes: 'Stop before tendon strain. Baseline: 45 sec. Target: 90 sec by Week 12.'
      }
    ],
    notes: 'Hanging Knee Raises NOT included in Phase 1 core. Will be added in Phase 2 if elbows consistently ≤2/10 for 2+ weeks.'
  },

  // Saturday — Day F: Zone 2 Cardio
  {
    dayIndex: 5,
    dayLabel: 'F',
    phase: 1,
    label: 'Saturday',
    title: 'Day F — Zone 2 Cardio',
    type: 'cardio',
    duration: '60-90 min',
    warmUp: [],
    hrZones: [
      { zone: 2, targetMinutes: 75, bpmRange: '129-141' }
    ],
    modality: ['cycling', 'running', 'rowing', 'swimming', 'brisk uphill walk'],
    exercises: [
      {
        name: 'Zone 2 Cardio',
        sets: '60-90 min',
        notes: 'Maintain heart rate 129-141 bpm. Should be able to speak in full sentences (talk test). Primary: cycling (weekend rides).'
      }
    ],
    notes: 'Steady-state Zone 2 work builds aerobic base and mitochondrial density. Talk test: you should be able to speak in full sentences. Alternatives: running, rowing, swimming, or brisk uphill walk.'
  },

  // Sunday — Active Recovery & Mobility
  {
    dayIndex: 6,
    dayLabel: 'rest',
    phase: 1,
    label: 'Sunday',
    title: 'Active Recovery & Mobility',
    type: 'mobility',
    duration: '20-30 min',
    warmUp: [],
    exercises: [
      {
        name: 'Light walking or easy cycling',
        sets: '10-15 min',
        notes: 'Very easy pace, movement for recovery.'
      },
      {
        name: 'Hip 90/90 transitions',
        sets: '2×8/side',
        notes: 'Controlled transitions, focus on hip mobility.'
      },
      {
        name: 'Cat-cow',
        sets: '1×10',
        notes: 'Spinal mobility and breathing.'
      },
      {
        name: "World's greatest stretch",
        sets: '1×5/side',
        notes: 'Full-body mobility drill.'
      },
      {
        name: 'Pigeon stretch',
        sets: '1×30s/side',
        notes: 'Hip flexor and glute stretch.'
      },
      {
        name: 'Thoracic spine rotations',
        sets: '1×8/side',
        notes: 'Upper back mobility.'
      },
      {
        name: 'Shoulder wall slides',
        sets: '1×10',
        notes: 'Shoulder mobility and scapular control.'
      },
      {
        name: 'Single-leg balance (eyes closed)',
        sets: '3×max time/side',
        notes: 'Proprioception and balance training.'
      },
      {
        name: 'Foam rolling',
        sets: 'As desired',
        notes: 'Quads, IT band, glutes, thoracic spine, lats.'
      }
    ],
    notes: 'Focus on movement quality and recovery. Track resting heart rate — sustained jump of 5+ bpm is early sign of overtraining.'
  }
];

// ============================================================================
// PHASE 2: Weeks 7-12 (Strength + Hypertrophy Progression)
// ============================================================================

export const PHASE_2_PLAN: TrainingDay[] = [
  // Monday — Day A: Lower + Carry + Calves
  {
    dayIndex: 0,
    dayLabel: 'A',
    phase: 2,
    label: 'Monday',
    title: 'Day A — Lower + Carry + Calves',
    type: 'strength',
    duration: '55-65 min',
    warmUp: [],
    exercises: [
      {
        name: 'Pendulum Squat',
        sets: '5×5',
        notes: 'Heavier load than Phase 1. Add 2.5 kg when you hit all reps across all sets for two consecutive sessions.'
      },
      {
        name: 'Romanian Deadlift',
        sets: '4×6-8',
        notes: 'Add 2.5 kg when you hit top of rep range across all sets for two consecutive sessions.'
      },
      {
        name: 'Walking Lunges',
        sets: '3×12/leg',
        notes: 'Single-leg stability and quad/glute hypertrophy.'
      },
      {
        name: 'Farmer Carry',
        sets: '5×45-60 sec',
        notes: 'Heavier load or longer duration than Phase 1. Target: 90 sec by Week 12.'
      },
      {
        name: 'Standing Calf Raise',
        sets: '3×15',
        notes: 'Add load when bodyweight feels easy.'
      }
    ],
    notes: 'Plank removed from Day A in Phase 2 to allow more recovery for pulling work.'
  },

  // Tuesday — Rest / Active Recovery
  {
    dayIndex: 1,
    dayLabel: 'rest',
    phase: 2,
    label: 'Tuesday',
    title: 'Rest Day',
    type: 'rest',
    duration: '—',
    warmUp: [],
    exercises: [],
    notes: 'Optional: light mobility work, walking, or complete rest.'
  },

  // Wednesday — Day B: Upper Push/Pull + Arms (Tendon-Safe)
  {
    dayIndex: 2,
    dayLabel: 'B',
    phase: 2,
    label: 'Wednesday',
    title: 'Day B — Upper Push/Pull + Arms',
    type: 'strength',
    duration: '60-70 min',
    warmUp: [
      { name: 'Band face pulls', prescription: '×20' },
      { name: 'Scap pull-ups', prescription: '×8' },
      { name: 'Wrist extensor band work', prescription: '×15' }
    ],
    exercises: [
      {
        name: 'Pull-ups (submaximal)',
        sets: 'Weeks 7-10: 6×4 → 5×5 | Weeks 11-12: Test max reps',
        notes: 'Strict form, ~2 RIR. Target: 10-12 reps by Week 12.'
      },
      {
        name: 'Eccentric Pull-ups',
        sets: '2×3',
        notes: '6 sec lowering. Stop immediately if elbow pain >3/10.'
      },
      {
        name: 'DB Bench Press',
        sets: '4×6-10',
        notes: 'Add 2 kg (per dumbbell) when you complete all sets at top of rep range for two sessions in a row.'
      },
      {
        name: 'Cable Pushdown or Overhead Tricep Extension',
        sets: '2×12-15',
        notes: 'Controlled tempo, no grinding.'
      },
      {
        name: 'One-arm Row (neutral grip)',
        sets: '3×10',
        notes: 'Add 2 kg (per dumbbell) when you complete all sets at top of rep range for two sessions. Prioritize controlled tempo.'
      },
      {
        name: 'Dips',
        sets: '2×6 → build to 3×10',
        notes: 'ONLY include if elbow pain consistently ≤2/10 for 2+ weeks. Drop immediately if medial elbow pain increases. Substitute with floor press or weighted push-ups if in doubt.'
      },
      {
        name: 'External Rotations (band)',
        sets: '2×15',
        notes: 'Shoulder health and tendon prehab.'
      },
      {
        name: 'Slow Hammer Curl',
        sets: '2×12',
        notes: '3 sec up / 3 sec down. Tendon medicine for brachioradialis. Stay light, never grind.'
      },
      {
        name: 'Reverse Curl (EZ bar or DB)',
        sets: '2×12',
        notes: 'Targets wrist extensors and forearm in rehab-friendly range.'
      }
    ],
    notes: 'Dips added in Phase 2 — monitor elbow pain closely. If pain >2/10, substitute immediately.'
  },

  // Thursday — Day E: Norwegian 4×4 HIIT
  {
    dayIndex: 3,
    dayLabel: 'E',
    phase: 2,
    label: 'Thursday',
    title: 'Day E — Norwegian 4×4 HIIT',
    type: 'hiit',
    duration: '~43 min',
    warmUp: [],
    hrZones: [
      { zone: 5, targetMinutes: 16, bpmRange: '151-169' },
      { zone: 2, targetMinutes: 9, bpmRange: '117-141' },
      { zone: 1, targetMinutes: 15, bpmRange: '<117' }
    ],
    modality: ['running', 'cycling', 'rowing', 'elliptical'],
    exercises: [
      {
        name: 'Warm-up',
        sets: '10 min',
        notes: 'Zone 1-2 (117-141 bpm). Easy pace to elevate heart rate gradually.'
      },
      {
        name: 'Interval 1',
        sets: '4 min',
        notes: 'Zone 5 (151-169 bpm). Hard effort — should be difficult to speak.'
      },
      {
        name: 'Recovery 1',
        sets: '3 min',
        notes: 'Zone 1-2 (117-141 bpm). Active recovery, keep moving.'
      },
      {
        name: 'Interval 2',
        sets: '4 min',
        notes: 'Zone 5 (151-169 bpm). Hard effort — should be difficult to speak.'
      },
      {
        name: 'Recovery 2',
        sets: '3 min',
        notes: 'Zone 1-2 (117-141 bpm). Active recovery, keep moving.'
      },
      {
        name: 'Interval 3',
        sets: '4 min',
        notes: 'Zone 5 (151-169 bpm). Hard effort — should be difficult to speak.'
      },
      {
        name: 'Recovery 3',
        sets: '3 min',
        notes: 'Zone 1-2 (117-141 bpm). Active recovery, keep moving.'
      },
      {
        name: 'Interval 4',
        sets: '4 min',
        notes: 'Zone 5 (151-169 bpm). Hard effort — should be difficult to speak.'
      },
      {
        name: 'Cooldown',
        sets: '5 min',
        notes: 'Zone 1 (<117 bpm). Gradually bring heart rate down.'
      }
    ],
    notes: 'Norwegian 4×4 protocol: 4 intervals of 4 min at Zone 5 with 3 min active recovery. Choose any cardio modality — running, cycling, rowing, or elliptical.'
  },

  // Friday — Day C: Full Body + Chest + Hang Exposure
  {
    dayIndex: 4,
    dayLabel: 'C',
    phase: 2,
    label: 'Friday',
    title: 'Day C — Full Body + Chest + Hang',
    type: 'strength',
    duration: '55-65 min',
    warmUp: [],
    exercises: [
      {
        name: 'Deadlift (moderate)',
        sets: '4×4',
        notes: 'Add 2.5 kg when all sets feel controlled with 2 RIR. Heavier than Phase 1.'
      },
      {
        name: 'Overhead Press (DB)',
        sets: '3-4×6-8',
        notes: 'Add 1-2 kg per dumbbell using two-session rule from Day B accessories.'
      },
      {
        name: 'Incline Push-up or Cable Fly',
        sets: '3×10-12',
        notes: 'Second weekly chest stimulus; zero elbow tendon load.'
      },
      {
        name: 'Step-ups',
        sets: '3×10/leg',
        notes: 'Single-leg strength and balance.'
      },
      {
        name: 'Hanging Knee Raises',
        sets: '2×6-8 → 3×10',
        notes: 'ONLY include if elbows consistently ≤2/10 for 2+ weeks. If not, continue Dead Bug + Pallof Press from Phase 1.'
      },
      {
        name: 'Hang Practice',
        sets: '2-3 rounds × 20-45 sec',
        notes: 'Stop before tendon strain. Target: 90 sec by Week 12.'
      }
    ],
    notes: 'Hanging Knee Raises added in Phase 2 — monitor elbow pain closely. If pain >2/10, revert to Dead Bug + Pallof Press.'
  },

  // Saturday — Day F: Zone 2 Cardio
  {
    dayIndex: 5,
    dayLabel: 'F',
    phase: 2,
    label: 'Saturday',
    title: 'Day F — Zone 2 Cardio',
    type: 'cardio',
    duration: '60-90 min',
    warmUp: [],
    hrZones: [
      { zone: 2, targetMinutes: 75, bpmRange: '129-141' }
    ],
    modality: ['cycling', 'running', 'rowing', 'swimming', 'brisk uphill walk'],
    exercises: [
      {
        name: 'Zone 2 Cardio',
        sets: '60-90 min',
        notes: 'Maintain heart rate 129-141 bpm. Should be able to speak in full sentences (talk test). Primary: cycling (weekend rides).'
      }
    ],
    notes: 'Steady-state Zone 2 work builds aerobic base and mitochondrial density. Talk test: you should be able to speak in full sentences. Alternatives: running, rowing, swimming, or brisk uphill walk.'
  },

  // Sunday — Active Recovery & Mobility
  {
    dayIndex: 6,
    dayLabel: 'rest',
    phase: 2,
    label: 'Sunday',
    title: 'Active Recovery & Mobility',
    type: 'mobility',
    duration: '20-30 min',
    warmUp: [],
    exercises: [
      {
        name: 'Light walking or easy cycling',
        sets: '10-15 min',
        notes: 'Very easy pace, movement for recovery.'
      },
      {
        name: 'Hip 90/90 transitions',
        sets: '2×8/side',
        notes: 'Controlled transitions, focus on hip mobility.'
      },
      {
        name: 'Cat-cow',
        sets: '1×10',
        notes: 'Spinal mobility and breathing.'
      },
      {
        name: "World's greatest stretch",
        sets: '1×5/side',
        notes: 'Full-body mobility drill.'
      },
      {
        name: 'Pigeon stretch',
        sets: '1×30s/side',
        notes: 'Hip flexor and glute stretch.'
      },
      {
        name: 'Thoracic spine rotations',
        sets: '1×8/side',
        notes: 'Upper back mobility.'
      },
      {
        name: 'Shoulder wall slides',
        sets: '1×10',
        notes: 'Shoulder mobility and scapular control.'
      },
      {
        name: 'Single-leg balance (eyes closed)',
        sets: '3×max time/side',
        notes: 'Proprioception and balance training.'
      },
      {
        name: 'Foam rolling',
        sets: 'As desired',
        notes: 'Quads, IT band, glutes, thoracic spine, lats.'
      }
    ],
    notes: 'Focus on movement quality and recovery. Track resting heart rate — sustained jump of 5+ bpm is early sign of overtraining.'
  }
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Returns today's training plan for the given phase.
 * @param phase - Phase 1 (Weeks 1-6) or Phase 2 (Weeks 7-12)
 */
export function getTodaysPlan(phase: Phase): TrainingDay {
  // JS getDay(): 0=Sunday, 1=Monday...6=Saturday
  // Our dayIndex: 0=Monday...6=Sunday
  const jsDay = new Date().getDay();
  const dayIndex = jsDay === 0 ? 6 : jsDay - 1;

  const plan = phase === 1 ? PHASE_1_PLAN : PHASE_2_PLAN;
  return plan[dayIndex];
}

/**
 * Returns the full week schedule for the given phase.
 * @param phase - Phase 1 (Weeks 1-6) or Phase 2 (Weeks 7-12)
 */
export function getWeekSchedule(phase: Phase): TrainingDay[] {
  return phase === 1 ? PHASE_1_PLAN : PHASE_2_PLAN;
}

/**
 * Calculates the current phase based on program start date.
 * Phase 1: Weeks 1-6 (Days 0-41)
 * Phase 2: Weeks 7-12 (Days 42-83)
 * After Week 12, defaults to Phase 2.
 *
 * @param startDate - The date the program started
 * @returns Current phase (1 or 2)
 */
export function getCurrentPhase(startDate: Date): Phase {
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Phase 1: Days 0-41 (Weeks 1-6)
  // Phase 2: Days 42+ (Weeks 7-12 and beyond)
  return daysSinceStart < 42 ? 1 : 2;
}

/**
 * Returns the current week number in the program (1-12+).
 * @param startDate - The date the program started
 */
export function getCurrentWeek(startDate: Date): number {
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(daysSinceStart / 7) + 1;
}

/**
 * Determines if the current week is a deload week (every 4th week).
 * @param startDate - The date the program started
 */
export function isDeloadWeek(startDate: Date): boolean {
  const week = getCurrentWeek(startDate);
  return week % 4 === 0;
}

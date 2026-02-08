/**
 * Recovery-adjusted training recommendations.
 *
 * Combines Whoop recovery status (traffic light), elbow pain level,
 * and deload week status to modify daily training prescriptions.
 */

export interface RecoveryAdjustment {
  volumeModifier: number; // 1.0 = full, 0.7 = reduced, 0.5 = minimal
  skipExercises: string[]; // exercise names to skip
  message: string; // shown in dashboard hero
  severity: 'none' | 'caution' | 'reduce' | 'skip';
}

type TrainingDayType = 'strength' | 'hiit' | 'cardio' | 'mobility' | 'rest';
type TrafficLight = 'green' | 'yellow' | 'red';

const SEVERITY_ORDER: Record<RecoveryAdjustment['severity'], number> = {
  none: 0,
  caution: 1,
  reduce: 2,
  skip: 3,
};

const HEAVY_COMPOUNDS = [
  'Pendulum Squat',
  'Deadlift (moderate)',
  'Romanian Deadlift',
  'DB Bench Press',
];

const ELBOW_PAIN_MILD_SKIP = ['Eccentric Pull-ups', 'Dips'];

const ELBOW_PAIN_SEVERE_SKIP = [
  'Pull-ups (submaximal)',
  'Eccentric Pull-ups',
  'Dips',
  'One-arm Row (neutral grip)',
  'Hanging Knee Raises',
];

const DELOAD_SKIP = ['Eccentric Pull-ups', 'Dips'];

function worstSeverity(
  a: RecoveryAdjustment['severity'],
  b: RecoveryAdjustment['severity']
): RecoveryAdjustment['severity'] {
  return SEVERITY_ORDER[a] >= SEVERITY_ORDER[b] ? a : b;
}

function mergeMessages(messages: string[]): string {
  return messages.filter(Boolean).join('. ');
}

function uniqueExercises(lists: string[][]): string[] {
  return Array.from(new Set(lists.flat()));
}

/**
 * Gets the base adjustment from traffic light + day type combination.
 */
function getBaseAdjustment(
  trafficLight: TrafficLight,
  dayType: TrainingDayType
): RecoveryAdjustment {
  // Rest/mobility/cardio days with green/yellow: no modifications
  if (
    (dayType === 'rest' || dayType === 'mobility' || dayType === 'cardio') &&
    trafficLight !== 'red'
  ) {
    return { volumeModifier: 1.0, skipExercises: [], message: '', severity: 'none' };
  }

  // Red + strength: skip heavy compounds
  if (trafficLight === 'red' && dayType === 'strength') {
    return {
      volumeModifier: 0.5,
      skipExercises: [...HEAVY_COMPOUNDS],
      message: 'Recovery is low — skip heavy compounds, do mobility instead',
      severity: 'skip',
    };
  }

  // Red + HIIT: convert to Zone 2
  if (trafficLight === 'red' && dayType === 'hiit') {
    return {
      volumeModifier: 0.5,
      skipExercises: [],
      message: 'Recovery is low — convert HIIT to easy Zone 2',
      severity: 'reduce',
    };
  }

  // Red + cardio/rest/mobility (remaining red cases)
  if (trafficLight === 'red') {
    return {
      volumeModifier: 0.5,
      skipExercises: [],
      message: 'Recovery is low — keep activity light',
      severity: 'reduce',
    };
  }

  // Yellow + strength
  if (trafficLight === 'yellow' && dayType === 'strength') {
    return {
      volumeModifier: 0.7,
      skipExercises: [],
      message: 'Moderate recovery — reduce volume ~20-30% (drop last 1-2 sets)',
      severity: 'caution',
    };
  }

  // Yellow + HIIT
  if (trafficLight === 'yellow' && dayType === 'hiit') {
    return {
      volumeModifier: 0.8,
      skipExercises: [],
      message: 'Moderate recovery — reduce interval intensity, consider 3x4 instead of 4x4',
      severity: 'caution',
    };
  }

  // Green + any: full send
  return { volumeModifier: 1.0, skipExercises: [], message: '', severity: 'none' };
}

/**
 * Gets adjustment layer for elbow pain.
 */
function getElbowPainAdjustment(elbowPain: number | null): RecoveryAdjustment | null {
  if (elbowPain === null || elbowPain <= 3) {
    return null;
  }

  if (elbowPain > 5) {
    return {
      volumeModifier: 1.0,
      skipExercises: [...ELBOW_PAIN_SEVERE_SKIP],
      message: 'High elbow pain — skipping all pulling exercises',
      severity: 'caution',
    };
  }

  // elbowPain > 3 && <= 5
  return {
    volumeModifier: 1.0,
    skipExercises: [...ELBOW_PAIN_MILD_SKIP],
    message: 'Elbow pain elevated — skipping eccentric pulls and dips',
    severity: 'caution',
  };
}

/**
 * Gets adjustment layer for deload week.
 */
function getDeloadAdjustment(isDeload: boolean): RecoveryAdjustment | null {
  if (!isDeload) {
    return null;
  }

  return {
    volumeModifier: 0.6,
    skipExercises: [...DELOAD_SKIP],
    message: 'Deload week — ~40% less load, ~35% fewer sets',
    severity: 'reduce',
  };
}

/**
 * Calculates training modifications based on recovery status, pain, and program phase.
 *
 * Layers are combined: base (traffic light + day type), then elbow pain, then deload.
 * - volumeModifier: minimum across all layers
 * - skipExercises: union of all layers
 * - severity: most severe across all layers
 * - message: concatenated from all layers
 */
export function getRecoveryAdjustments(
  trafficLight: TrafficLight,
  dayType: TrainingDayType,
  elbowPain: number | null,
  isDeload: boolean
): RecoveryAdjustment {
  const base = getBaseAdjustment(trafficLight, dayType);
  const elbowLayer = getElbowPainAdjustment(elbowPain);
  const deloadLayer = getDeloadAdjustment(isDeload);

  const layers = [base, elbowLayer, deloadLayer].filter(
    (l): l is RecoveryAdjustment => l !== null
  );

  const volumeModifier = Math.min(...layers.map((l) => l.volumeModifier));
  const skipExercises = uniqueExercises(layers.map((l) => l.skipExercises));
  const severity = layers.reduce(
    (worst, l) => worstSeverity(worst, l.severity),
    'none' as RecoveryAdjustment['severity']
  );
  const message = mergeMessages(layers.map((l) => l.message));

  return { volumeModifier, skipExercises, message, severity };
}

/**
 * Volume calculation utilities for tracking training load.
 *
 * Volume is calculated as: weight × reps × sets
 * This helps track total mechanical work performed.
 */

export interface VolumeSet {
  weight: number;
  reps: number;
  is_warmup?: boolean;
  muscle_group?: string;
}

export interface ExerciseVolume {
  exercise_name: string;
  muscle_group: string;
  sets: VolumeSet[];
  total_volume: number;
  working_sets: number;
}

export interface MuscleGroupVolume {
  muscle_group: string;
  total_volume: number;
  exercise_count: number;
  set_count: number;
}

/**
 * Calculates the total volume (weight × reps) for a single set.
 *
 * @param {number} weight - Weight lifted
 * @param {number} reps - Number of reps performed
 * @returns {number} Total volume for the set
 *
 * @example
 * ```ts
 * const volume = calculateSetVolume(100, 10); // Returns 1000
 * ```
 */
export function calculateSetVolume(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) {
    return 0;
  }

  return weight * reps;
}

/**
 * Calculates the total volume for an exercise, excluding warmup sets.
 *
 * @param {VolumeSet[]} sets - Array of sets for the exercise
 * @returns {number} Total volume across all working sets
 *
 * @example
 * ```ts
 * const sets = [
 *   { weight: 50, reps: 10, is_warmup: true },
 *   { weight: 100, reps: 10, is_warmup: false },
 *   { weight: 100, reps: 8, is_warmup: false },
 * ];
 * const volume = calculateExerciseVolume(sets); // Returns 1800
 * ```
 */
export function calculateExerciseVolume(sets: VolumeSet[]): number {
  if (!sets || sets.length === 0) {
    return 0;
  }

  return sets
    .filter((set) => !set.is_warmup)
    .reduce((total, set) => total + calculateSetVolume(set.weight, set.reps), 0);
}

/**
 * Aggregates volume by muscle group from a list of exercises.
 *
 * @param {ExerciseVolume[]} exercises - Array of exercises with volume data
 * @returns {MuscleGroupVolume[]} Array of muscle group volume summaries
 *
 * @example
 * ```ts
 * const exercises = [
 *   {
 *     exercise_name: 'Bench Press',
 *     muscle_group: 'chest',
 *     sets: [{ weight: 100, reps: 10 }],
 *     total_volume: 1000,
 *     working_sets: 1,
 *   },
 *   {
 *     exercise_name: 'Incline Press',
 *     muscle_group: 'chest',
 *     sets: [{ weight: 80, reps: 10 }],
 *     total_volume: 800,
 *     working_sets: 1,
 *   },
 * ];
 * const volumeByMuscle = aggregateVolumeByMuscleGroup(exercises);
 * // Returns: [{ muscle_group: 'chest', total_volume: 1800, exercise_count: 2, set_count: 2 }]
 * ```
 */
export function aggregateVolumeByMuscleGroup(exercises: ExerciseVolume[]): MuscleGroupVolume[] {
  if (!exercises || exercises.length === 0) {
    return [];
  }

  const volumeMap = new Map<string, MuscleGroupVolume>();

  exercises.forEach((exercise) => {
    const muscleGroup = exercise.muscle_group.toLowerCase();
    const existing = volumeMap.get(muscleGroup);

    if (existing) {
      existing.total_volume += exercise.total_volume;
      existing.exercise_count += 1;
      existing.set_count += exercise.working_sets;
    } else {
      volumeMap.set(muscleGroup, {
        muscle_group: muscleGroup,
        total_volume: exercise.total_volume,
        exercise_count: 1,
        set_count: exercise.working_sets,
      });
    }
  });

  return Array.from(volumeMap.values()).sort((a, b) => b.total_volume - a.total_volume);
}

/**
 * Calculates weekly volume for each muscle group from a time-series dataset.
 *
 * @param {ExerciseVolume[]} exercises - Array of exercises with timestamps
 * @param {Date} weekStart - Start of the week
 * @param {Date} weekEnd - End of the week
 * @returns {MuscleGroupVolume[]} Weekly volume by muscle group
 *
 * @example
 * ```ts
 * const weekStart = new Date('2024-01-01');
 * const weekEnd = new Date('2024-01-07');
 * const weeklyVolume = calculateWeeklyVolume(exercises, weekStart, weekEnd);
 * ```
 */
export function calculateWeeklyVolume(
  exercises: ExerciseVolume[],
  weekStart: Date,
  weekEnd: Date
): MuscleGroupVolume[] {
  if (!exercises || exercises.length === 0) {
    return [];
  }

  // In a real implementation, you would filter exercises by date
  // For now, we aggregate all provided exercises
  return aggregateVolumeByMuscleGroup(exercises);
}

/**
 * Calculates volume load index (normalized volume per set).
 *
 * This metric helps compare training intensity across different time periods
 * by accounting for the number of sets performed.
 *
 * @param {number} totalVolume - Total volume
 * @param {number} totalSets - Total number of working sets
 * @returns {number} Average volume per set
 *
 * @example
 * ```ts
 * const loadIndex = calculateVolumeLoadIndex(5000, 20); // Returns 250
 * ```
 */
export function calculateVolumeLoadIndex(totalVolume: number, totalSets: number): number {
  if (totalSets <= 0 || totalVolume < 0) {
    return 0;
  }

  return Math.round((totalVolume / totalSets) * 100) / 100;
}

/**
 * Compares current week volume to previous week and returns percentage change.
 *
 * @param {number} currentVolume - Current week's total volume
 * @param {number} previousVolume - Previous week's total volume
 * @returns {{ change: number; direction: 'increase' | 'decrease' | 'stable' }} Volume change analysis
 *
 * @example
 * ```ts
 * const comparison = compareWeeklyVolume(5500, 5000);
 * // Returns: { change: 10, direction: 'increase' }
 * ```
 */
export function compareWeeklyVolume(
  currentVolume: number,
  previousVolume: number
): { change: number; direction: 'increase' | 'decrease' | 'stable' } {
  if (previousVolume <= 0) {
    return { change: 0, direction: 'stable' };
  }

  const percentageChange = ((currentVolume - previousVolume) / previousVolume) * 100;
  const roundedChange = Math.round(percentageChange * 10) / 10;

  let direction: 'increase' | 'decrease' | 'stable';
  if (Math.abs(roundedChange) < 5) {
    direction = 'stable';
  } else if (roundedChange > 0) {
    direction = 'increase';
  } else {
    direction = 'decrease';
  }

  return {
    change: Math.abs(roundedChange),
    direction,
  };
}

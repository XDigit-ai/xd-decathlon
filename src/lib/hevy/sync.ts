/**
 * Hevy Sync Logic
 * Syncs workout data from Hevy API to Supabase database
 * Calculates 1RM estimates and detects personal records
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { createHevyClient } from './client';
import { calculateOneRM } from '@/lib/calculations/one-rm';
import type {
  HevyApiWorkout,
  HevyApiExercise,
  HevyApiSet,
  SyncSummary,
  WorkoutSyncResult,
} from './types';

// Hardcoded user ID for single-user app
const USER_ID = '0e8cc399-f19b-4dae-9eff-80e1ef81b875';

/**
 * Sync all workouts from Hevy API to database
 * Performs a full sync of all workout data
 */
export async function syncAllWorkouts(): Promise<SyncSummary> {
  const startTime = Date.now();
  const summary: SyncSummary = {
    success: false,
    workouts_processed: 0,
    exercises_processed: 0,
    sets_processed: 0,
    one_rms_calculated: 0,
    prs_detected: 0,
    errors: [],
    started_at: new Date().toISOString(),
    completed_at: '',
    duration_ms: 0,
  };

  try {
    const hevyClient = createHevyClient();
    const supabase = createAdminClient();

    console.log('[Hevy Sync] Starting full sync...');

    // Fetch all workouts from Hevy
    const workouts = await hevyClient.getAllWorkouts((current, total) => {
      console.log(`[Hevy Sync] Fetching workouts: page ${current}/${total}`);
    });

    console.log(`[Hevy Sync] Fetched ${workouts.length} workouts from Hevy`);

    // Process each workout
    for (const workout of workouts) {
      try {
        const result = await syncWorkout(workout.id, workout);
        summary.workouts_processed++;
        summary.exercises_processed += result.exercises_count;
        summary.sets_processed += result.sets_count;
        summary.one_rms_calculated += result.one_rms_calculated;
        summary.prs_detected += result.prs_detected;

        if (result.error) {
          summary.errors.push(`Workout ${workout.id}: ${result.error}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        summary.errors.push(`Workout ${workout.id}: ${errorMsg}`);
        console.error(`[Hevy Sync] Error syncing workout ${workout.id}:`, error);
      }
    }

    summary.success = summary.errors.length === 0;
    summary.completed_at = new Date().toISOString();
    summary.duration_ms = Date.now() - startTime;

    console.log('[Hevy Sync] Sync completed:', summary);

    return summary;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    summary.errors.push(`Sync failed: ${errorMsg}`);
    summary.completed_at = new Date().toISOString();
    summary.duration_ms = Date.now() - startTime;

    console.error('[Hevy Sync] Sync failed:', error);

    return summary;
  }
}

/**
 * Sync a single workout by ID
 * Used for webhook updates and individual workout sync
 */
export async function syncWorkout(
  workoutId: string,
  workoutData?: HevyApiWorkout
): Promise<WorkoutSyncResult> {
  const result: WorkoutSyncResult = {
    workout_id: '',
    hevy_id: workoutId,
    exercises_count: 0,
    sets_count: 0,
    one_rms_calculated: 0,
    prs_detected: 0,
  };

  try {
    const supabase = createAdminClient();

    // Fetch workout data if not provided
    let workout = workoutData;
    if (!workout) {
      const hevyClient = createHevyClient();
      workout = await hevyClient.getWorkout(workoutId);
    }

    console.log(`[Hevy Sync] Syncing workout: ${workout.title} (${workout.id})`);

    // Calculate workout metrics
    const totalVolume = calculateWorkoutVolume(workout);
    const totalSets = countWorkoutSets(workout);
    const duration = calculateWorkoutDuration(workout);

    // Upsert workout
    const { data: dbWorkout, error: workoutError } = await supabase
      .from('hevy_workouts')
      .upsert(
        {
          user_id: USER_ID,
          hevy_id: workout.id,
          title: workout.title || 'Untitled Workout',
          start_time: workout.start_time,
          end_time: workout.end_time || workout.start_time,
          duration_seconds: duration,
          total_volume_kg: totalVolume,
          total_sets: totalSets,
          raw_data: workout,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'hevy_id' }
      )
      .select()
      .single();

    if (workoutError) {
      throw new Error(`Failed to upsert workout: ${workoutError.message}`);
    }

    result.workout_id = dbWorkout.id;

    // Process each exercise in the workout
    for (const exercise of workout.exercises || []) {
      try {
        const exerciseResult = await syncExercise(dbWorkout.id, exercise);
        result.exercises_count++;
        result.sets_count += exerciseResult.sets_count;
        result.one_rms_calculated += exerciseResult.one_rm_calculated ? 1 : 0;
        result.prs_detected += exerciseResult.prs_detected;
      } catch (error) {
        console.error(`[Hevy Sync] Error syncing exercise ${exercise.title}:`, error);
        result.error = `Exercise sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    console.log(`[Hevy Sync] Workout synced successfully:`, result);

    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Hevy Sync] Failed to sync workout ${workoutId}:`, error);
    return result;
  }
}

/**
 * Sync a single exercise and its sets
 */
async function syncExercise(
  workoutId: string,
  exercise: HevyApiExercise
): Promise<{
  sets_count: number;
  one_rm_calculated: boolean;
  prs_detected: number;
}> {
  const supabase = createAdminClient();

  // First, ensure the exercise template exists
  const { data: template, error: templateError } = await supabase
    .from('exercise_templates')
    .upsert(
      {
        user_id: USER_ID,
        hevy_template_id: exercise.exercise_template_id,
        title: exercise.title,
      },
      { onConflict: 'hevy_template_id' }
    )
    .select()
    .single();

  if (templateError) {
    throw new Error(`Failed to upsert exercise template: ${templateError.message}`);
  }

  // Upsert workout exercise (link between workout and exercise)
  const { data: workoutExercise, error: workoutExerciseError } = await supabase
    .from('hevy_workout_exercises')
    .upsert(
      {
        user_id: USER_ID,
        workout_id: workoutId,
        hevy_exercise_id: exercise.exercise_template_id,
        title: exercise.title,
        exercise_index: exercise.index ?? 0,
        superset_id: exercise.superset_id ?? null,
        notes: exercise.notes || null,
      },
      {
        onConflict: 'workout_id,exercise_index',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (workoutExerciseError) {
    throw new Error(`Failed to upsert workout exercise: ${workoutExerciseError.message}`);
  }

  // Delete existing sets for this exercise (to handle updates)
  await supabase
    .from('hevy_sets')
    .delete()
    .eq('exercise_id', workoutExercise.id);

  // Insert all sets
  const sets = (exercise.sets || []).map((set, index) => ({
    user_id: USER_ID,
    exercise_id: workoutExercise.id,
    set_index: set.index ?? index,
    set_type: set.type || 'normal',
    weight_kg: set.weight_kg || null,
    reps: set.reps || null,
    rpe: set.rpe || null,
    distance_meters: set.distance_meters || null,
    duration_seconds: set.duration_seconds || null,
  }));

  let setsInserted = 0;
  if (sets.length > 0) {
    const { error: setsError, count } = await supabase
      .from('hevy_sets')
      .insert(sets)
      .select();

    if (setsError) {
      throw new Error(`Failed to insert sets: ${setsError.message}`);
    }

    setsInserted = count || sets.length;
  }

  // Calculate 1RM and check for PRs
  const oneRmCalculated = await calculate1RMForExercise(
    template.id,
    exercise.sets || []
  );

  const prsDetected = await detectPersonalRecords(
    template.id,
    workoutId,
    exercise.sets || []
  );

  return {
    sets_count: setsInserted,
    one_rm_calculated: oneRmCalculated,
    prs_detected: prsDetected,
  };
}

/**
 * Calculate estimated 1RM for an exercise based on its sets
 */
async function calculate1RMForExercise(
  exerciseTemplateId: string,
  sets: HevyApiSet[]
): Promise<boolean> {
  const supabase = createAdminClient();

  // Filter valid sets for 1RM calculation
  const validSets = sets.filter(
    (set) =>
      set.type === 'normal' &&
      set.weight_kg &&
      set.weight_kg > 0 &&
      set.reps &&
      set.reps >= 1 &&
      set.reps <= 12
  );

  if (validSets.length === 0) {
    return false;
  }

  // Calculate 1RM for each valid set and find the best one
  let best1RM = 0;
  let bestSet: HevyApiSet | null = null;

  for (const set of validSets) {
    const oneRM = calculateOneRM(set.weight_kg!, set.reps!);
    if (oneRM > best1RM) {
      best1RM = oneRM;
      bestSet = set;
    }
  }

  if (!bestSet || best1RM === 0) {
    return false;
  }

  // Get the workout date from the workout associated with these sets
  // For simplicity, use today's date (in production, we'd fetch from the workout)
  const today = new Date().toISOString().split('T')[0];

  // Upsert the 1RM estimate
  const { error } = await supabase.from('estimated_1rm').upsert(
    {
      user_id: USER_ID,
      exercise_template_id: exerciseTemplateId,
      date: today,
      estimated_1rm_kg: best1RM,
      formula: 'epley',
      best_set_weight: bestSet.weight_kg,
      best_set_reps: bestSet.reps,
    },
    { onConflict: 'user_id,exercise_template_id,date' }
  );

  if (error) {
    console.error('[Hevy Sync] Failed to insert 1RM:', error);
    return false;
  }

  return true;
}

/**
 * Detect personal records for an exercise
 */
async function detectPersonalRecords(
  exerciseTemplateId: string,
  workoutId: string,
  sets: HevyApiSet[]
): Promise<number> {
  const supabase = createAdminClient();
  let prsDetected = 0;

  // Get workout date
  const { data: workout } = await supabase
    .from('hevy_workouts')
    .select('start_time')
    .eq('id', workoutId)
    .single();

  const workoutDate = workout?.start_time
    ? new Date(workout.start_time).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  // Check for max weight PR
  const maxWeight = Math.max(
    ...sets.filter((s) => s.weight_kg).map((s) => s.weight_kg!)
  );

  if (maxWeight > 0) {
    const prDetected = await checkAndInsertPR(
      exerciseTemplateId,
      'max_weight',
      maxWeight,
      workoutDate
    );
    if (prDetected) prsDetected++;
  }

  // Check for max reps PR (at any weight)
  const maxReps = Math.max(...sets.filter((s) => s.reps).map((s) => s.reps!));

  if (maxReps > 0) {
    const prDetected = await checkAndInsertPR(
      exerciseTemplateId,
      'max_reps',
      maxReps,
      workoutDate
    );
    if (prDetected) prsDetected++;
  }

  // Check for 1RM PR
  const validSets = sets.filter(
    (set) =>
      set.type === 'normal' &&
      set.weight_kg &&
      set.weight_kg > 0 &&
      set.reps &&
      set.reps >= 1 &&
      set.reps <= 12
  );

  if (validSets.length > 0) {
    const best1RM = Math.max(
      ...validSets.map((s) => calculateOneRM(s.weight_kg!, s.reps!))
    );

    if (best1RM > 0) {
      const prDetected = await checkAndInsertPR(
        exerciseTemplateId,
        'one_rm',
        best1RM,
        workoutDate
      );
      if (prDetected) prsDetected++;
    }
  }

  // Check for max volume PR (total weight × reps for all sets)
  const totalVolume = sets.reduce((sum, set) => {
    if (set.weight_kg && set.reps) {
      return sum + set.weight_kg * set.reps;
    }
    return sum;
  }, 0);

  if (totalVolume > 0) {
    const prDetected = await checkAndInsertPR(
      exerciseTemplateId,
      'max_volume',
      totalVolume,
      workoutDate
    );
    if (prDetected) prsDetected++;
  }

  return prsDetected;
}

/**
 * Check if a value is a new PR and insert it if so
 */
async function checkAndInsertPR(
  exerciseTemplateId: string,
  recordType: 'one_rm' | 'max_weight' | 'max_volume' | 'max_reps',
  value: number,
  date: string
): Promise<boolean> {
  const supabase = createAdminClient();

  // Get the current best record for this exercise and type
  const { data: existingPR } = await supabase
    .from('personal_records')
    .select('value')
    .eq('user_id', USER_ID)
    .eq('exercise_template_id', exerciseTemplateId)
    .eq('record_type', recordType)
    .order('value', { ascending: false })
    .limit(1)
    .single();

  const currentBest = existingPR?.value || 0;

  // Only insert if this is a new PR
  if (value > currentBest) {
    const { error } = await supabase.from('personal_records').insert({
      user_id: USER_ID,
      exercise_template_id: exerciseTemplateId,
      record_type: recordType,
      value: value,
      date: date,
      previous_value: currentBest > 0 ? currentBest : null,
    });

    if (error) {
      console.error('[Hevy Sync] Failed to insert PR:', error);
      return false;
    }

    console.log(`[Hevy Sync] New PR detected: ${recordType} = ${value}`);
    return true;
  }

  return false;
}

/**
 * Calculate total volume for a workout (sum of weight × reps for all sets)
 */
function calculateWorkoutVolume(workout: HevyApiWorkout): number {
  let totalVolume = 0;

  for (const exercise of workout.exercises || []) {
    for (const set of exercise.sets || []) {
      if (set.weight_kg && set.reps) {
        totalVolume += set.weight_kg * set.reps;
      }
    }
  }

  return totalVolume;
}

/**
 * Count total sets in a workout
 */
function countWorkoutSets(workout: HevyApiWorkout): number {
  return (workout.exercises || []).reduce(
    (sum, exercise) => sum + (exercise.sets?.length || 0),
    0
  );
}

/**
 * Calculate workout duration in seconds
 */
function calculateWorkoutDuration(workout: HevyApiWorkout): number | null {
  if (!workout.start_time || !workout.end_time) {
    return null;
  }

  const start = new Date(workout.start_time);
  const end = new Date(workout.end_time);

  return Math.floor((end.getTime() - start.getTime()) / 1000);
}

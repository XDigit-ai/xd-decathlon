'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  HevyWorkout,
  HevyWorkoutExercise,
  HevySet,
  PersonalRecord,
  ExerciseTemplate,
} from '@/types/database';
import type { DateRange } from '@/types/metrics';

// ============================================================================
// COMPOSITE TYPES
// ============================================================================

interface WorkoutWithDetails extends HevyWorkout {
  exercises: (HevyWorkoutExercise & {
    sets: HevySet[];
  })[];
}

// ============================================================================
// WORKOUTS HOOK
// ============================================================================

interface UseWorkoutsResult {
  data: WorkoutWithDetails[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching workouts with exercises and sets
 * @param range Optional date range filter
 * @returns Workouts data with nested exercises and sets
 */
export function useWorkouts(range?: DateRange): UseWorkoutsResult {
  const [data, setData] = useState<WorkoutWithDetails[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Build query with optional date filtering
      let query = supabase
        .from('hevy_workouts')
        .select('*')
        .order('start_time', { ascending: false });

      if (range) {
        query = query
          .gte('start_time', range.start)
          .lte('start_time', range.end);
      }

      const { data: workouts, error: workoutsError } = await query;

      if (workoutsError) throw workoutsError;

      if (!workouts || workouts.length === 0) {
        setData([]);
        return;
      }

      // Fetch exercises and sets for all workouts
      const workoutIds = workouts.map((w) => w.id);

      const { data: exercises, error: exercisesError } = await supabase
        .from('hevy_workout_exercises')
        .select('*')
        .in('workout_id', workoutIds)
        .order('exercise_index', { ascending: true });

      if (exercisesError) throw exercisesError;

      const exerciseIds = exercises?.map((e) => e.id) || [];

      const { data: sets, error: setsError } = await supabase
        .from('hevy_sets')
        .select('*')
        .in('exercise_id', exerciseIds)
        .order('set_index', { ascending: true });

      if (setsError) throw setsError;

      // Assemble the data structure
      const workoutsWithDetails: WorkoutWithDetails[] = workouts.map(
        (workout) => {
          const workoutExercises = exercises?.filter(
            (e) => e.workout_id === workout.id
          );

          const exercisesWithSets = workoutExercises?.map((exercise) => ({
            ...exercise,
            sets: sets?.filter((s) => s.exercise_id === exercise.id) || [],
          }));

          return {
            ...workout,
            exercises: exercisesWithSets || [],
          };
        }
      );

      setData(workoutsWithDetails);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch workouts')
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range?.start, range?.end]);

  return { data, isLoading, error, refetch: fetchData };
}

// ============================================================================
// SINGLE EXERCISE HOOK
// ============================================================================

interface ExerciseHistoryEntry {
  date: string;
  workout_id: string;
  workout_title: string;
  sets: HevySet[];
  best_set: {
    weight_kg: number;
    reps: number;
  } | null;
  total_volume_kg: number;
}

interface UseExerciseResult {
  data: ExerciseHistoryEntry[] | null;
  template: ExerciseTemplate | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching exercise history and template
 * @param exerciseTemplateId Exercise template ID
 * @returns Exercise history with sets and template info
 */
export function useExercise(exerciseTemplateId: string): UseExerciseResult {
  const [data, setData] = useState<ExerciseHistoryEntry[] | null>(null);
  const [template, setTemplate] = useState<ExerciseTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Fetch exercise template
      const { data: templateData, error: templateError } = await supabase
        .from('exercise_templates')
        .select('*')
        .eq('id', exerciseTemplateId)
        .single();

      if (templateError) throw templateError;
      setTemplate(templateData);

      // Fetch all workout exercises for this template
      const { data: exercises, error: exercisesError } = await supabase
        .from('hevy_workout_exercises')
        .select(
          `
          *,
          workout:hevy_workouts(id, title, start_time)
        `
        )
        .eq('title', templateData.title)
        .order('created_at', { ascending: false });

      if (exercisesError) throw exercisesError;

      if (!exercises || exercises.length === 0) {
        setData([]);
        return;
      }

      // Fetch sets for all exercises
      const exerciseIds = exercises.map((e) => e.id);
      const { data: sets, error: setsError } = await supabase
        .from('hevy_sets')
        .select('*')
        .in('exercise_id', exerciseIds)
        .order('set_index', { ascending: true });

      if (setsError) throw setsError;

      // Assemble history entries
      const history: ExerciseHistoryEntry[] = exercises.map((exercise: any) => {
        const exerciseSets =
          sets?.filter((s) => s.exercise_id === exercise.id) || [];

        // Calculate best set
        let bestSet: { weight_kg: number; reps: number } | null = null;
        let maxVolume = 0;

        exerciseSets.forEach((set) => {
          if (set.weight_kg && set.reps) {
            const volume = set.weight_kg * set.reps;
            if (volume > maxVolume) {
              maxVolume = volume;
              bestSet = {
                weight_kg: set.weight_kg,
                reps: set.reps,
              };
            }
          }
        });

        // Calculate total volume
        const totalVolume = exerciseSets.reduce((sum, set) => {
          return sum + (set.weight_kg && set.reps ? set.weight_kg * set.reps : 0);
        }, 0);

        return {
          date: exercise.workout.start_time.split('T')[0],
          workout_id: exercise.workout.id,
          workout_title: exercise.workout.title,
          sets: exerciseSets,
          best_set: bestSet,
          total_volume_kg: totalVolume,
        };
      });

      setData(history);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to fetch exercise history')
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (exerciseTemplateId) {
      fetchData();
    }
  }, [exerciseTemplateId]);

  return { data, template, isLoading, error, refetch: fetchData };
}

// ============================================================================
// PERSONAL RECORDS HOOK
// ============================================================================

interface UsePersonalRecordsResult {
  data: PersonalRecord[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching personal records
 * @returns Personal records data, loading state, and error
 */
export function usePersonalRecords(): UsePersonalRecordsResult {
  const [data, setData] = useState<PersonalRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      const { data: records, error: fetchError } = await supabase
        .from('personal_records')
        .select(
          `
          *,
          exercise_template:exercise_templates(title, muscle_group)
        `
        )
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      setData(records || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to fetch personal records')
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}

// ============================================================================
// RECENT WORKOUTS HOOK
// ============================================================================

interface UseRecentWorkoutsResult {
  data: WorkoutWithDetails[] | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching recent workouts
 * @param limit Number of workouts to fetch
 * @returns Recent workouts data and loading state
 */
export function useRecentWorkouts(limit: number = 5): UseRecentWorkoutsResult {
  const [data, setData] = useState<WorkoutWithDetails[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const supabase = createClient();

        const { data: workouts, error: workoutsError } = await supabase
          .from('hevy_workouts')
          .select('*')
          .order('start_time', { ascending: false })
          .limit(limit);

        if (workoutsError) throw workoutsError;

        if (!workouts || workouts.length === 0) {
          setData([]);
          return;
        }

        const workoutIds = workouts.map((w) => w.id);

        const { data: exercises, error: exercisesError } = await supabase
          .from('hevy_workout_exercises')
          .select('*')
          .in('workout_id', workoutIds)
          .order('exercise_index', { ascending: true });

        if (exercisesError) throw exercisesError;

        const exerciseIds = exercises?.map((e) => e.id) || [];

        const { data: sets, error: setsError } = await supabase
          .from('hevy_sets')
          .select('*')
          .in('exercise_id', exerciseIds)
          .order('set_index', { ascending: true });

        if (setsError) throw setsError;

        const workoutsWithDetails: WorkoutWithDetails[] = workouts.map(
          (workout) => {
            const workoutExercises = exercises?.filter(
              (e) => e.workout_id === workout.id
            );

            const exercisesWithSets = workoutExercises?.map((exercise) => ({
              ...exercise,
              sets: sets?.filter((s) => s.exercise_id === exercise.id) || [],
            }));

            return {
              ...workout,
              exercises: exercisesWithSets || [],
            };
          }
        );

        setData(workoutsWithDetails);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to fetch recent workouts')
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  return { data, isLoading, error };
}

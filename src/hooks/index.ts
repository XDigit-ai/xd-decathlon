/**
 * Central export for all React hooks
 */

// Metrics hooks
export {
  useBodyMetrics,
  useFunctionalTests,
  useWeightTrend,
} from './use-metrics';

// Target hooks
export {
  useTargets,
  useCreateTarget,
  useUpdateTarget,
  useTarget,
} from './use-targets';

// Workout hooks
export {
  useWorkouts,
  useExercise,
  usePersonalRecords,
  useRecentWorkouts,
} from './use-workouts';

// Recovery hooks
export {
  useRecovery,
  useSleep,
  useTrafficLight,
  useWhoopWorkouts,
  useRecoveryTrends,
} from './use-recovery';

// Realtime hooks
export {
  useRealtimeSubscription,
  useWorkoutUpdates,
  useRecoveryUpdates,
  useTargetUpdates,
  useWeightUpdates,
  usePresence,
  useBroadcast,
} from './use-realtime';

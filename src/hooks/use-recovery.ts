'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  WhoopRecovery,
  WhoopSleep,
  WhoopWorkout,
  TrafficLight,
} from '@/types/database';
import type { DateRange } from '@/types/metrics';

// ============================================================================
// RECOVERY HOOK
// ============================================================================

interface UseRecoveryResult {
  data: WhoopRecovery[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching Whoop recovery data
 * @param range Optional date range filter
 * @returns Recovery data, loading state, and error
 */
export function useRecovery(range?: DateRange): UseRecoveryResult {
  const [data, setData] = useState<WhoopRecovery[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      let query = supabase
        .from('whoop_recovery')
        .select('*')
        .order('date', { ascending: false });

      if (range) {
        query = query.gte('date', range.start).lte('date', range.end);
      }

      const { data: recovery, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setData(recovery || []);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch recovery data')
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
// SLEEP HOOK
// ============================================================================

interface UseSleepResult {
  data: WhoopSleep[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching Whoop sleep data
 * @param range Optional date range filter
 * @returns Sleep data, loading state, and error
 */
export function useSleep(range?: DateRange): UseSleepResult {
  const [data, setData] = useState<WhoopSleep[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      let query = supabase
        .from('whoop_sleep')
        .select('*')
        .order('date', { ascending: false });

      if (range) {
        query = query.gte('date', range.start).lte('date', range.end);
      }

      const { data: sleep, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setData(sleep || []);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch sleep data')
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
// TRAFFIC LIGHT HOOK
// ============================================================================

interface TrafficLightStatus {
  traffic_light: TrafficLight;
  recovery_score: number | null;
  hrv: number | null;
  resting_hr: number | null;
  sleep_performance: number | null;
  date: string;
  message: string;
}

interface UseTrafficLightResult {
  data: TrafficLightStatus | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching current traffic light recovery status
 * @returns Current recovery status with traffic light indicator
 */
export function useTrafficLight(): UseTrafficLightResult {
  const [data, setData] = useState<TrafficLightStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getStatusMessage = (
    trafficLight: TrafficLight,
    recoveryScore: number | null
  ): string => {
    if (!recoveryScore) {
      return 'Recovery data not available';
    }

    switch (trafficLight) {
      case 'green':
        return 'Ready to train hard';
      case 'yellow':
        return 'Proceed with caution';
      case 'red':
        return 'Prioritize recovery';
      default:
        return 'Status unknown';
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Fetch most recent recovery data
      const { data: recovery, error: recoveryError } = await supabase
        .from('whoop_recovery')
        .select('*')
        .lte('date', today)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (recoveryError && recoveryError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned"
        throw recoveryError;
      }

      // Fetch most recent sleep data
      const { data: sleep, error: sleepError } = await supabase
        .from('whoop_sleep')
        .select('*')
        .lte('date', today)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (sleepError && sleepError.code !== 'PGRST116') {
        throw sleepError;
      }

      if (recovery) {
        setData({
          traffic_light: recovery.traffic_light || 'yellow',
          recovery_score: recovery.recovery_score,
          hrv: recovery.hrv_rmssd,
          resting_hr: recovery.resting_hr,
          sleep_performance: sleep?.sleep_performance || null,
          date: recovery.date,
          message: getStatusMessage(
            recovery.traffic_light || 'yellow',
            recovery.recovery_score
          ),
        });
      } else {
        setData({
          traffic_light: 'yellow',
          recovery_score: null,
          hrv: null,
          resting_hr: null,
          sleep_performance: null,
          date: today,
          message: 'No recovery data available',
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to fetch traffic light status')
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
// WHOOP WORKOUTS HOOK
// ============================================================================

interface UseWhoopWorkoutsResult {
  data: WhoopWorkout[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching Whoop workout data
 * @param range Optional date range filter
 * @returns Whoop workout data, loading state, and error
 */
export function useWhoopWorkouts(range?: DateRange): UseWhoopWorkoutsResult {
  const [data, setData] = useState<WhoopWorkout[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      let query = supabase
        .from('whoop_workouts')
        .select('*')
        .order('date', { ascending: false });

      if (range) {
        query = query.gte('date', range.start).lte('date', range.end);
      }

      const { data: workouts, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setData(workouts || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to fetch Whoop workouts')
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
// RECOVERY TRENDS HOOK
// ============================================================================

interface RecoveryTrends {
  average_recovery: number;
  average_hrv: number;
  average_rhr: number;
  green_days: number;
  yellow_days: number;
  red_days: number;
  trend: 'improving' | 'declining' | 'stable';
}

interface UseRecoveryTrendsResult {
  data: RecoveryTrends | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for calculating recovery trends
 * @param days Number of days to analyze
 * @returns Recovery trend statistics
 */
export function useRecoveryTrends(days: number = 30): UseRecoveryTrendsResult {
  const [data, setData] = useState<RecoveryTrends | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data: recovery, error: fetchError } = await supabase
          .from('whoop_recovery')
          .select('*')
          .gte('date', startDate.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (fetchError) throw fetchError;

        if (!recovery || recovery.length === 0) {
          setData(null);
          return;
        }

        // Calculate averages
        const validRecovery = recovery.filter((r) => r.recovery_score !== null);
        const validHrv = recovery.filter((r) => r.hrv_rmssd !== null);
        const validRhr = recovery.filter((r) => r.resting_hr !== null);

        const avgRecovery =
          validRecovery.reduce((sum, r) => sum + (r.recovery_score || 0), 0) /
          validRecovery.length;

        const avgHrv =
          validHrv.reduce((sum, r) => sum + (r.hrv_rmssd || 0), 0) /
          validHrv.length;

        const avgRhr =
          validRhr.reduce((sum, r) => sum + (r.resting_hr || 0), 0) /
          validRhr.length;

        // Count traffic light days
        const greenDays = recovery.filter(
          (r) => r.traffic_light === 'green'
        ).length;
        const yellowDays = recovery.filter(
          (r) => r.traffic_light === 'yellow'
        ).length;
        const redDays = recovery.filter(
          (r) => r.traffic_light === 'red'
        ).length;

        // Calculate trend
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (validRecovery.length >= 6) {
          const firstHalf = validRecovery.slice(0, Math.floor(validRecovery.length / 2));
          const secondHalf = validRecovery.slice(-Math.floor(validRecovery.length / 2));

          const firstAvg =
            firstHalf.reduce((sum, r) => sum + (r.recovery_score || 0), 0) /
            firstHalf.length;
          const secondAvg =
            secondHalf.reduce((sum, r) => sum + (r.recovery_score || 0), 0) /
            secondHalf.length;

          const diff = secondAvg - firstAvg;
          if (diff > 5) {
            trend = 'improving';
          } else if (diff < -5) {
            trend = 'declining';
          }
        }

        setData({
          average_recovery: Math.round(avgRecovery),
          average_hrv: Math.round(avgHrv),
          average_rhr: Math.round(avgRhr),
          green_days: greenDays,
          yellow_days: yellowDays,
          red_days: redDays,
          trend,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to calculate recovery trends')
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [days]);

  return { data, isLoading, error };
}

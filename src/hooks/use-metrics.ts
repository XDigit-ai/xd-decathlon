'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  DailyWeight,
  BodyMeasurement,
  DexaScan,
} from '@/types/database';
import type { DateRange } from '@/types/metrics';

// ============================================================================
// BODY METRICS HOOK
// ============================================================================

interface BodyMetricsData {
  weights: DailyWeight[];
  measurements: BodyMeasurement[];
  dexa: DexaScan[];
}

interface UseBodyMetricsResult {
  data: BodyMetricsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching body composition metrics
 * @param range Optional date range filter
 * @returns Body metrics data, loading state, and error
 */
export function useBodyMetrics(range?: DateRange): UseBodyMetricsResult {
  const [data, setData] = useState<BodyMetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Build queries with optional date filtering
      let weightsQuery = supabase
        .from('daily_weight')
        .select('*')
        .order('date', { ascending: false });

      let measurementsQuery = supabase
        .from('body_measurements')
        .select('*')
        .order('date', { ascending: false });

      let dexaQuery = supabase
        .from('dexa_scans')
        .select('*')
        .order('date', { ascending: false });

      // Apply date range filters if provided
      if (range) {
        weightsQuery = weightsQuery
          .gte('date', range.start)
          .lte('date', range.end);
        measurementsQuery = measurementsQuery
          .gte('date', range.start)
          .lte('date', range.end);
        dexaQuery = dexaQuery.gte('date', range.start).lte('date', range.end);
      }

      // Execute queries in parallel
      const [weightsResult, measurementsResult, dexaResult] =
        await Promise.all([
          weightsQuery,
          measurementsQuery,
          dexaQuery,
        ]);

      // Check for errors
      if (weightsResult.error) throw weightsResult.error;
      if (measurementsResult.error) throw measurementsResult.error;
      if (dexaResult.error) throw dexaResult.error;

      setData({
        weights: weightsResult.data || [],
        measurements: measurementsResult.data || [],
        dexa: dexaResult.data || [],
      });
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch body metrics')
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
// FUNCTIONAL TESTS HOOK
// ============================================================================

export interface FunctionalTest {
  id: string;
  user_id: string;
  test_name: string;
  value: number;
  unit: string;
  date: string;
  notes: string | null;
  created_at: string;
}

interface UseFunctionalTestsResult {
  data: FunctionalTest[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching functional test results
 * @returns Functional test data, loading state, and error
 */
export function useFunctionalTests(): UseFunctionalTestsResult {
  const [data, setData] = useState<FunctionalTest[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Note: This assumes a functional_tests table exists
      // If not, this should be created in a future migration
      const { data: tests, error: fetchError } = await supabase
        .from('functional_tests')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      setData(tests || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to fetch functional tests')
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
// WEIGHT TREND HOOK
// ============================================================================

interface UseWeightTrendResult {
  data: DailyWeight[] | null;
  average: number | null;
  trend: 'increasing' | 'decreasing' | 'stable' | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching weight trend with calculated statistics
 * @param days Number of days to analyze
 * @returns Weight trend data with statistics
 */
export function useWeightTrend(days: number = 30): UseWeightTrendResult {
  const [data, setData] = useState<DailyWeight[] | null>(null);
  const [average, setAverage] = useState<number | null>(null);
  const [trend, setTrend] = useState<
    'increasing' | 'decreasing' | 'stable' | null
  >(null);
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

        const { data: weights, error: fetchError } = await supabase
          .from('daily_weight')
          .select('*')
          .gte('date', startDate.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (fetchError) throw fetchError;

        if (weights && weights.length > 0) {
          // Calculate average
          const avg =
            weights.reduce((sum, w) => sum + w.weight_kg, 0) / weights.length;
          setAverage(avg);

          // Calculate trend (simple linear regression)
          if (weights.length >= 3) {
            const firstThird = weights.slice(0, Math.floor(weights.length / 3));
            const lastThird = weights.slice(-Math.floor(weights.length / 3));

            const firstAvg =
              firstThird.reduce((sum, w) => sum + w.weight_kg, 0) /
              firstThird.length;
            const lastAvg =
              lastThird.reduce((sum, w) => sum + w.weight_kg, 0) /
              lastThird.length;

            const diff = lastAvg - firstAvg;
            if (Math.abs(diff) < 0.5) {
              setTrend('stable');
            } else if (diff > 0) {
              setTrend('increasing');
            } else {
              setTrend('decreasing');
            }
          } else {
            setTrend('stable');
          }
        }

        setData(weights || []);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch weight trend')
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [days]);

  return { data, average, trend, isLoading, error };
}

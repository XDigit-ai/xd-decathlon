'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Target, TargetDomain, TargetInsert, TargetUpdate } from '@/types/database';
import type { TargetWithProgress } from '@/types/targets';
import { TARGET_METRICS } from '@/types/targets';

// ============================================================================
// TARGETS HOOK
// ============================================================================

interface UseTargetsResult {
  data: TargetWithProgress[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching all active targets with progress calculations
 * @returns Targets data with progress, loading state, and error
 */
export function useTargets(): UseTargetsResult {
  const [data, setData] = useState<TargetWithProgress[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const calculateProgress = (target: Target): TargetWithProgress => {
    const startDate = new Date(target.start_date);
    const now = new Date();
    const daysElapsed = Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate days remaining for each timeframe
    const daysRemaining3m = Math.max(0, 90 - daysElapsed);
    const daysRemaining6m = Math.max(0, 180 - daysElapsed);
    const daysRemaining12m = Math.max(0, 365 - daysElapsed);

    // Calculate progress percentage
    let progressPercentage = 0;
    if (target.baseline !== null && target.current_value !== null) {
      const activeTarget =
        target.target_3m || target.target_6m || target.target_12m;
      if (activeTarget !== null) {
        const totalChange = activeTarget - target.baseline;
        const currentChange = target.current_value - target.baseline;
        progressPercentage =
          totalChange !== 0 ? (currentChange / totalChange) * 100 : 0;
      }
    }

    // Calculate on-track status for each timeframe
    const calculateOnTrack = (
      targetValue: number | null,
      daysTotal: number
    ): boolean => {
      if (
        !targetValue ||
        target.baseline === null ||
        target.current_value === null
      ) {
        return false;
      }

      const totalChange = targetValue - target.baseline;
      const expectedChange = (totalChange * daysElapsed) / daysTotal;
      const actualChange = target.current_value - target.baseline;

      const metricInfo = TARGET_METRICS[target.domain];
      if (metricInfo.increase_is_better) {
        return actualChange >= expectedChange * 0.8; // 80% of expected is "on track"
      } else {
        return actualChange <= expectedChange * 1.2; // Within 120% for decreasing metrics
      }
    };

    const onTrack3m = calculateOnTrack(target.target_3m, 90);
    const onTrack6m = calculateOnTrack(target.target_6m, 180);
    const onTrack12m = calculateOnTrack(target.target_12m, 365);

    // Calculate trajectory (projected value at 3 months)
    let currentTrajectory: number | null = null;
    if (
      target.baseline !== null &&
      target.current_value !== null &&
      daysElapsed > 0
    ) {
      const changeRate =
        (target.current_value - target.baseline) / daysElapsed;
      currentTrajectory = target.current_value + changeRate * (90 - daysElapsed);
    }

    return {
      ...target,
      progress_percentage: Math.round(progressPercentage),
      days_elapsed: daysElapsed,
      days_remaining_3m: daysRemaining3m,
      days_remaining_6m: daysRemaining6m,
      days_remaining_12m: daysRemaining12m,
      on_track_3m: onTrack3m,
      on_track_6m: onTrack6m,
      on_track_12m: onTrack12m,
      current_trajectory: currentTrajectory,
      metric_info: TARGET_METRICS[target.domain],
    };
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      const { data: targets, error: fetchError } = await supabase
        .from('targets')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const targetsWithProgress =
        targets?.map((target) => calculateProgress(target)) || [];

      setData(targetsWithProgress);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch targets')
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
// CREATE TARGET HOOK
// ============================================================================

interface UseCreateTargetResult {
  createTarget: (target: TargetInsert) => Promise<Target | null>;
  isCreating: boolean;
  error: Error | null;
}

/**
 * Hook for creating new targets
 * @returns Function to create target, loading state, and error
 */
export function useCreateTarget(): UseCreateTargetResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTarget = async (
    targetData: TargetInsert
  ): Promise<Target | null> => {
    try {
      setIsCreating(true);
      setError(null);

      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get metric info for the domain
      const metricInfo = TARGET_METRICS[targetData.domain];

      const { data, error: createError } = await supabase
        .from('targets')
        .insert({
          ...targetData,
          user_id: user.id,
          metric_name: metricInfo.name,
          unit: metricInfo.unit,
        })
        .select()
        .single();

      if (createError) throw createError;

      return data;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to create target');
      setError(error);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return { createTarget, isCreating, error };
}

// ============================================================================
// UPDATE TARGET HOOK
// ============================================================================

interface UseUpdateTargetResult {
  updateTarget: (id: string, updates: TargetUpdate) => Promise<Target | null>;
  isUpdating: boolean;
  error: Error | null;
}

/**
 * Hook for updating existing targets
 * @returns Function to update target, loading state, and error
 */
export function useUpdateTarget(): UseUpdateTargetResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTarget = async (
    id: string,
    updates: TargetUpdate
  ): Promise<Target | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      const supabase = createClient();

      const { data, error: updateError } = await supabase
        .from('targets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      return data;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to update target');
      setError(error);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateTarget, isUpdating, error };
}

// ============================================================================
// SINGLE TARGET HOOK
// ============================================================================

interface UseTargetResult {
  data: TargetWithProgress | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a single target by ID
 * @param targetId Target ID to fetch
 * @returns Target data with progress, loading state, and error
 */
export function useTarget(targetId: string): UseTargetResult {
  const [data, setData] = useState<TargetWithProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      const { data: target, error: fetchError } = await supabase
        .from('targets')
        .select('*')
        .eq('id', targetId)
        .single();

      if (fetchError) throw fetchError;

      if (target) {
        const startDate = new Date(target.start_date);
        const now = new Date();
        const daysElapsed = Math.floor(
          (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const daysRemaining3m = Math.max(0, 90 - daysElapsed);
        const daysRemaining6m = Math.max(0, 180 - daysElapsed);
        const daysRemaining12m = Math.max(0, 365 - daysElapsed);

        let progressPercentage = 0;
        if (target.baseline !== null && target.current_value !== null) {
          const activeTarget =
            target.target_3m || target.target_6m || target.target_12m;
          if (activeTarget !== null) {
            const totalChange = activeTarget - target.baseline;
            const currentChange = target.current_value - target.baseline;
            progressPercentage =
              totalChange !== 0 ? (currentChange / totalChange) * 100 : 0;
          }
        }

        setData({
          ...target,
          progress_percentage: Math.round(progressPercentage),
          days_elapsed: daysElapsed,
          days_remaining_3m: daysRemaining3m,
          days_remaining_6m: daysRemaining6m,
          days_remaining_12m: daysRemaining12m,
          on_track_3m: false,
          on_track_6m: false,
          on_track_12m: false,
          current_trajectory: null,
          metric_info: TARGET_METRICS[target.domain as TargetDomain],
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch target')
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (targetId) {
      fetchData();
    }
  }, [targetId]);

  return { data, isLoading, error, refetch: fetchData };
}

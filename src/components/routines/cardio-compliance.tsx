'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { HrZoneTarget } from '@/lib/training-plan';
import type { WhoopWorkout } from '@/types/database';
import { cn } from '@/lib/utils/cn';
import { Activity, Loader2 } from 'lucide-react';

interface CardioComplianceProps {
  hrZones: HrZoneTarget[];
}

function getZoneMinutes(workout: WhoopWorkout, zone: number): number {
  switch (zone) {
    case 1: return workout.zone1_minutes;
    case 2: return workout.zone2_minutes;
    case 3: return workout.zone3_minutes;
    case 4: return workout.zone4_minutes;
    case 5: return workout.zone5_minutes;
    default: return 0;
  }
}

function getProgressColor(percentage: number): string {
  if (percentage >= 90) return 'bg-green-500';
  if (percentage >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

export function CardioCompliance({ hrZones }: CardioComplianceProps) {
  const [workout, setWorkout] = useState<WhoopWorkout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTodaysWorkout() {
      try {
        const supabase = createClient();
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('whoop_workouts')
          .select('*')
          .eq('date', today)
          .order('duration_minutes', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) setWorkout(data);
      } catch {
        // Silently fail — component degrades to targets-only mode
      } finally {
        setIsLoading(false);
      }
    }
    fetchTodaysWorkout();
  }, []);

  const hasSynced = workout !== null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading workout data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {hasSynced ? 'Zone Compliance' : 'Zone Targets'}
        </p>
        {hasSynced && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span>
              {workout.duration_minutes
                ? `${Math.round(workout.duration_minutes)} min recorded`
                : 'Workout recorded'}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        {hrZones.map((hz) => {
          const actual = hasSynced ? getZoneMinutes(workout, hz.zone) : 0;
          const pct = hz.targetMinutes > 0
            ? Math.min(100, Math.round((actual / hz.targetMinutes) * 100))
            : 0;

          return (
            <div key={hz.zone} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Zone {hz.zone}</span>
                <span className="text-xs text-muted-foreground">
                  {hasSynced ? (
                    <>
                      {actual}/{hz.targetMinutes} min
                      <span className={cn(
                        "ml-1.5 font-semibold",
                        pct >= 90 && "text-green-600 dark:text-green-400",
                        pct >= 70 && pct < 90 && "text-amber-600 dark:text-amber-400",
                        pct < 70 && "text-red-600 dark:text-red-400",
                      )}>
                        ({pct}%)
                      </span>
                    </>
                  ) : (
                    <>{hz.targetMinutes} min @ {hz.bpmRange} bpm</>
                  )}
                </span>
              </div>

              {hasSynced ? (
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", getProgressColor(pct))}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              ) : (
                <div className="h-2 w-full rounded-full bg-muted" />
              )}
            </div>
          );
        })}
      </div>

      {!hasSynced && (
        <p className="text-xs text-muted-foreground italic">
          Waiting for Whoop sync...
        </p>
      )}
    </div>
  );
}

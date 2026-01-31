import { createClient } from '@/lib/supabase/server';
import { ProgressSummary } from '@/components/targets/progress-summary';
import { TargetGrid } from '@/components/targets/target-grid';
import { TARGET_METRICS } from '@/types/targets';
import type { Target } from '@/types/database';
import type { TargetWithProgress, FitnessDomainCategory, TargetMetric } from '@/types/targets';

function calculateProgress(
  baseline: number | null,
  current: number | null,
  target: number | null,
  increaseIsBetter: boolean
): number {
  if (baseline === null || target === null || current === null) {
    return 0;
  }

  const totalChange = target - baseline;
  if (totalChange === 0) return 0;

  const currentChange = current - baseline;
  const progress = (currentChange / totalChange) * 100;

  return Math.max(0, Math.min(100, progress));
}

function daysBetween(date1: Date, date2: Date): number {
  const diff = date2.getTime() - date1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isOnTrack(
  daysElapsed: number,
  daysTotal: number,
  progressPercentage: number
): boolean {
  if (daysTotal === 0) return true;
  const expectedProgress = (daysElapsed / daysTotal) * 100;
  return progressPercentage >= expectedProgress * 0.8;
}

function enrichTargetWithProgress(target: Target): TargetWithProgress {
  const metricInfo: TargetMetric = TARGET_METRICS[target.domain];
  const now = new Date();
  const startDate = new Date(target.start_date);

  const daysElapsed = daysBetween(startDate, now);
  const currentValue = target.current_value ?? target.baseline;

  const progress3m = calculateProgress(
    target.baseline,
    currentValue,
    target.target_3m,
    metricInfo.increase_is_better
  );

  const progress6m = calculateProgress(
    target.baseline,
    currentValue,
    target.target_6m,
    metricInfo.increase_is_better
  );

  const progress12m = calculateProgress(
    target.baseline,
    currentValue,
    target.target_12m,
    metricInfo.increase_is_better
  );

  const latestTarget = target.target_12m ?? target.target_6m ?? target.target_3m;
  const overallProgress = calculateProgress(
    target.baseline,
    currentValue,
    latestTarget,
    metricInfo.increase_is_better
  );

  let currentTrajectory: number | null = null;
  if (target.baseline !== null && currentValue !== null && daysElapsed > 0) {
    const ratePerDay = (currentValue - target.baseline) / daysElapsed;
    currentTrajectory = target.baseline + ratePerDay * 365;
  }

  return {
    ...target,
    progress_percentage: overallProgress,
    days_elapsed: daysElapsed,
    days_remaining_3m: Math.max(0, 90 - daysElapsed),
    days_remaining_6m: Math.max(0, 180 - daysElapsed),
    days_remaining_12m: Math.max(0, 365 - daysElapsed),
    on_track_3m: isOnTrack(daysElapsed, 90, progress3m),
    on_track_6m: isOnTrack(daysElapsed, 180, progress6m),
    on_track_12m: isOnTrack(daysElapsed, 365, progress12m),
    current_trajectory: currentTrajectory,
    metric_info: metricInfo,
  };
}

async function getTargets(): Promise<TargetWithProgress[]> {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return [];
  }

  const { data: targets, error } = await supabase
    .from('targets')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching targets:', error);
    return [];
  }

  return (targets || []).map(enrichTargetWithProgress);
}

function groupTargetsByCategory(
  targets: TargetWithProgress[]
): Record<FitnessDomainCategory, TargetWithProgress[]> {
  const grouped: Record<FitnessDomainCategory, TargetWithProgress[]> = {
    body: [],
    strength: [],
    cardio: [],
    functional: [],
    recovery: [],
  };

  for (const target of targets) {
    const category = target.metric_info.category;
    grouped[category].push(target);
  }

  return grouped;
}

export default async function TargetsPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Please sign in to view your targets.</p>
      </div>
    );
  }

  const targets = await getTargets();
  const targetsByCategory = groupTargetsByCategory(targets);

  return (
    <div className="space-y-8 p-8">
      {targets.length > 0 && <ProgressSummary targets={targets} />}
      <TargetGrid targetsByCategory={targetsByCategory} />
    </div>
  );
}

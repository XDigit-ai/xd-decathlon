import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { StatusCard } from '@/components/dashboard/status-card';
import { RecoveryStatus } from '@/components/dashboard/recovery-status';
import { TargetProgress } from '@/components/dashboard/target-progress';
import { QuickAdd } from '@/components/dashboard/quick-add';
import { RecentWorkouts } from '@/components/dashboard/recent-workouts';
import { Activity, Dumbbell, Scale, Heart, TrendingUp } from 'lucide-react';
import { formatWeight } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';

interface Workout {
  id: string;
  title: string;
  started_at: string;
  total_volume_kg: number;
  total_sets: number;
}

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  // Calculate date ranges
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch all required data in parallel
  const [
    latestWeight,
    todayWellness,
    recentWorkoutsData,
    weeklyVolumeData,
    activeTargetsData,
    latestRecoveryData,
    profileData,
  ] = await Promise.all([
    // Latest weight entry
    supabase
      .from('daily_weight')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Today's wellness entry
    supabase
      .from('daily_wellness')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle(),

    // Recent workouts (last 5)
    supabase
      .from('hevy_workouts')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(5),

    // Weekly volume
    supabase
      .from('hevy_workouts')
      .select('total_volume_kg, total_sets')
      .eq('user_id', userId)
      .gte('started_at', sevenDaysAgo),

    // Active targets
    supabase
      .from('targets')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active'),

    // Latest recovery data
    supabase
      .from('whoop_recovery')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Profile data for baselines
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(),
  ]);

  // Calculate weekly metrics
  const totalVolume = weeklyVolumeData.data?.reduce(
    (sum, workout) => sum + (workout.total_volume_kg || 0),
    0
  ) || 0;

  const totalSets = weeklyVolumeData.data?.reduce(
    (sum, workout) => sum + (workout.total_sets || 0),
    0
  ) || 0;

  const workoutsThisWeek = weeklyVolumeData.data?.length || 0;

  // Calculate target progress
  const activeTargetsCount = activeTargetsData.data?.length || 0;
  const onTrackCount = activeTargetsData.data?.filter(
    (target) => (target.current_value || 0) >= (target.baseline || 0)
  ).length || 0;

  const avgProgress = activeTargetsCount > 0
    ? Math.round((onTrackCount / activeTargetsCount) * 100)
    : 0;

  // Determine recovery status
  const recoveryScore = latestRecoveryData.data?.recovery_score || 0;
  const trafficLight = latestRecoveryData.data?.traffic_light || 'green';
  const hrv = latestRecoveryData.data?.hrv || profileData.data?.hrv_baseline || 0;
  const rhr = latestRecoveryData.data?.resting_hr || profileData.data?.resting_hr || 0;

  // Default recovery message based on traffic light
  let recoveryMessage = 'Train as planned';
  if (trafficLight === 'yellow') {
    recoveryMessage = 'Consider lighter training';
  } else if (trafficLight === 'red') {
    recoveryMessage = 'Prioritize recovery';
  }

  return {
    weight: latestWeight.data,
    wellness: todayWellness.data,
    workouts: recentWorkoutsData.data || [],
    weeklyVolume: Math.round(totalVolume),
    totalSets,
    workoutsThisWeek,
    recoveryScore,
    trafficLight,
    hrv,
    rhr,
    avgProgress,
    activeTargetsCount,
    profile: profileData.data,
    recoveryMessage,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const dashboardData = await getDashboardData(user.id);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your fitness overview and recent activity
        </p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Recovery"
          icon={Heart}
          value={dashboardData.recoveryScore ? `${dashboardData.recoveryScore}%` : '--'}
          label="Recovery score"
        />
        <StatusCard
          title="Weekly Volume"
          icon={Dumbbell}
          value={dashboardData.weeklyVolume ? `${dashboardData.weeklyVolume.toLocaleString()} kg` : '--'}
          label={`${dashboardData.totalSets} sets this week`}
        />
        <StatusCard
          title="Workouts"
          icon={Activity}
          value={dashboardData.workoutsThisWeek.toString()}
          label="This week"
        />
        <StatusCard
          title="Weight"
          icon={Scale}
          value={
            dashboardData.weight
              ? formatWeight(dashboardData.weight.weight_kg, 'kg')
              : '--'
          }
          label={
            dashboardData.weight
              ? formatDate(dashboardData.weight.date)
              : 'No data'
          }
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recovery status */}
        <RecoveryStatus
          status={dashboardData.trafficLight as 'green' | 'yellow' | 'red'}
          message={dashboardData.recoveryMessage}
          hrv={dashboardData.hrv}
          rhr={dashboardData.rhr}
          sleepHours={0}
        />

        {/* Target progress */}
        <TargetProgress progress={dashboardData.avgProgress} />

        {/* Quick add */}
        <QuickAdd />

        {/* Recent workouts */}
        <RecentWorkouts workouts={dashboardData.workouts} />
      </div>
    </div>
  );
}

import { createClient, DEV_USER_ID } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Flag,
  CalendarCheck,
  Activity,
  Dumbbell,
  Moon,
  Heart,
  Scale,
  CheckSquare,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatWeight } from '@/lib/utils/format';
import Link from 'next/link';

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    targetsResult,
    workoutsResult,
    wellnessResult,
    recoveryResult,
    weightResult,
    profileResult,
  ] = await Promise.all([
    // Active targets with progress
    supabase
      .from('targets')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active'),
    // This week's workouts
    supabase
      .from('hevy_workouts')
      .select('id, title, start_time')
      .eq('user_id', userId)
      .gte('start_time', sevenDaysAgo)
      .order('start_time', { ascending: false }),
    // Today's wellness check-in
    supabase
      .from('daily_wellness')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle(),
    // Latest recovery
    supabase
      .from('whoop_recovery')
      .select('recovery_score, traffic_light, hrv')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7),
    // Latest weight
    supabase
      .from('daily_weight')
      .select('weight_kg, date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Profile baselines
    supabase
      .from('profiles')
      .select('hrv_baseline')
      .eq('id', userId)
      .maybeSingle(),
  ]);

  const targets = targetsResult.data || [];
  const workouts = workoutsResult.data || [];
  const recoveries = recoveryResult.data || [];

  // Objectives data
  const totalTargets = targets.length;
  const onTrackTargets = targets.filter(t => {
    const current = t.current_value ?? t.baseline ?? 0;
    const baseline = t.baseline ?? 0;
    return current >= baseline;
  }).length;
  const targetCompletion = totalTargets > 0
    ? Math.round((onTrackTargets / totalTargets) * 100)
    : 0;

  // Get 3 spotlight targets (most behind or closest to goal)
  const spotlightTargets = targets
    .map(t => {
      const goalValue = t.target_12m ?? t.target_6m ?? t.target_3m ?? t.baseline ?? 0;
      const current = t.current_value ?? t.baseline ?? 0;
      const baseline = t.baseline ?? 0;
      const total = goalValue - baseline;
      const progress = total !== 0 ? Math.max(0, Math.min(100, ((current - baseline) / total) * 100)) : 0;
      return { ...t, progress: Math.round(progress) };
    })
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 3);

  // Routines data
  const workoutsThisWeek = workouts.length;
  const hasCheckedIn = !!wellnessResult.data;

  // Vitals data
  const latestRecovery = recoveries[0];
  const recoveryScore = latestRecovery?.recovery_score ?? null;
  const trafficLight = (latestRecovery?.traffic_light ?? 'green') as 'green' | 'yellow' | 'red';

  const avgHRV = recoveries.length > 0
    ? Math.round(recoveries.reduce((sum, r) => sum + (r.hrv || 0), 0) / recoveries.length)
    : null;

  const currentWeight = weightResult.data?.weight_kg ?? null;

  return {
    targetCompletion,
    totalTargets,
    spotlightTargets,
    workoutsThisWeek,
    hasCheckedIn,
    recoveryScore,
    trafficLight,
    avgHRV,
    currentWeight,
    weightDate: weightResult.data?.date ?? null,
  };
}

export default async function DashboardPage() {
  const userId = DEV_USER_ID;
  const data = await getDashboardData(userId);

  const trafficColors = {
    green: { bg: 'bg-emerald-500', label: 'Optimal' },
    yellow: { bg: 'bg-amber-500', label: 'Moderate' },
    red: { bg: 'bg-rose-500', label: 'Low' },
  };
  const tc = trafficColors[data.trafficLight];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your fitness overview across objectives, routines, and vitals
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Objectives Panel */}
        <Card className="group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Flag className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">Objectives</CardTitle>
            </div>
            <Link href="/objectives" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall completion */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Target completion</span>
                <span className="text-2xl font-bold">{data.targetCompletion}%</span>
              </div>
              <Progress value={data.targetCompletion} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {data.totalTargets} active target{data.totalTargets !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Spotlight targets */}
            {data.spotlightTargets.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground">Focus areas</p>
                {data.spotlightTargets.map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-[160px]">{t.domain}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={t.progress} className="h-1.5 w-16" />
                      <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                        {t.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/objectives"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline pt-1"
            >
              All targets <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Routines Panel */}
        <Card className="group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <CalendarCheck className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">Routines</CardTitle>
            </div>
            <Link href="/routines" className="text-xs font-medium text-primary hover:underline">
              This week
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Workouts this week */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Workouts</span>
              </div>
              <span className="text-2xl font-bold">{data.workoutsThisWeek}</span>
            </div>

            {/* Check-in status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Today&apos;s check-in</span>
              </div>
              <Badge variant={data.hasCheckedIn ? "default" : "secondary"} className="text-xs">
                {data.hasCheckedIn ? "Done" : "Pending"}
              </Badge>
            </div>

            {/* Quick actions */}
            <div className="border-t pt-3 space-y-2">
              <Link
                href="/routines/workouts"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View workouts <ArrowRight className="h-3 w-3" />
              </Link>
              {!data.hasCheckedIn && (
                <Link
                  href="/routines/check-in"
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Do check-in <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vitals Panel */}
        <Card className="group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">Vitals</CardTitle>
            </div>
            <Link href="/vitals" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recovery */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded-full", tc.bg)} />
                <span className="text-sm text-muted-foreground">Recovery</span>
              </div>
              <span className="text-2xl font-bold">
                {data.recoveryScore !== null ? `${data.recoveryScore}%` : '--'}
              </span>
            </div>

            {/* HRV */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">HRV (7d avg)</span>
              </div>
              <span className="text-lg font-bold">
                {data.avgHRV !== null ? `${data.avgHRV} ms` : '--'}
              </span>
            </div>

            {/* Weight */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Weight</span>
              </div>
              <span className="text-lg font-bold">
                {data.currentWeight !== null ? formatWeight(data.currentWeight, 'kg') : '--'}
              </span>
            </div>

            {/* Links */}
            <div className="border-t pt-3 space-y-2">
              <Link
                href="/vitals/recovery"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Recovery details <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                href="/vitals/cardio"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Cardio & VO2 <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

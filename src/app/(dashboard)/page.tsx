import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/supabase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Flag,
  CalendarCheck,
  Activity,
  Dumbbell,
  Heart,
  Scale,
  ArrowRight,
  Clock,
  AlertTriangle,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatWeight } from '@/lib/utils/format';
import Link from 'next/link';
import {
  getTodaysPlan,
  getWeekSchedule,
  getCurrentPhase,
  getCurrentWeek,
  isDeloadWeek,
  type TrainingDay,
} from '@/lib/training-plan';
import {
  getRecoveryAdjustments,
  type RecoveryAdjustment,
} from '@/lib/calculations/recovery-adjustments';
import { TestingWeekBanner } from '@/components/routines/testing-week-banner';

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
    wellnessPainResult,
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
      .select('recovery_score, traffic_light, hrv_rmssd')
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
      .select('hrv_baseline, program_start_date')
      .eq('id', userId)
      .maybeSingle(),
    // Latest elbow pain
    supabase
      .from('daily_wellness')
      .select('elbow_pain')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
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
    ? Math.round(recoveries.reduce((sum, r) => sum + (r.hrv_rmssd || 0), 0) / recoveries.length)
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
    elbowPain: wellnessPainResult.data?.elbow_pain ?? null,
    programStartDate: profileResult.data?.program_start_date ?? null,
  };
}

const typeBadge: Record<TrainingDay['type'], { label: string; className: string }> = {
  strength: { label: 'Strength', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  hiit: { label: 'HIIT', className: 'bg-orange-500/15 text-orange-700 dark:text-orange-400' },
  cardio: { label: 'Zone 2', className: 'bg-teal-500/15 text-teal-700 dark:text-teal-400' },
  mobility: { label: 'Mobility', className: 'bg-purple-500/15 text-purple-700 dark:text-purple-400' },
  rest: { label: 'Rest', className: 'bg-gray-500/15 text-gray-700 dark:text-gray-400' },
};

const trafficColors = {
  green: { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', label: 'Optimal' },
  yellow: { bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', label: 'Moderate' },
  red: { bg: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', label: 'Low' },
};

const severityStyles: Record<RecoveryAdjustment['severity'], { bg: string; border: string; icon: string }> = {
  none: { bg: '', border: '', icon: '' },
  caution: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-500' },
  reduce: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'text-orange-500' },
  skip: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: 'text-rose-500' },
};

export default async function DashboardPage() {
  const user = await getAuthUser();
  const data = await getDashboardData(user.id);

  const programStartDate = data.programStartDate
    ? new Date(data.programStartDate)
    : new Date('2025-02-03'); // fallback
  const phase = getCurrentPhase(programStartDate);
  const todaysPlan = getTodaysPlan(phase);
  const weekSchedule = getWeekSchedule(phase);
  const currentWeek = getCurrentWeek(programStartDate);
  const deload = isDeloadWeek(programStartDate);
  const recoveryAdjustment = getRecoveryAdjustments(
    data.trafficLight,
    todaysPlan.type,
    data.elbowPain,
    deload
  );

  const tc = trafficColors[data.trafficLight];
  const badge = typeBadge[todaysPlan.type];

  // JS getDay(): 0=Sunday, 1=Monday...6=Saturday -> convert to 0=Monday...6=Sunday
  const jsDay = new Date().getDay();
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1;

  // Filter exercises based on recovery adjustments
  const activeExercises = todaysPlan.exercises.filter(
    (ex) => !recoveryAdjustment.skipExercises.includes(ex.name)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ─── HERO SECTION ─── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Recovery status */}
            <div className="flex items-center gap-3">
              <div className={cn('h-4 w-4 rounded-full', tc.bg)} />
              <div>
                <p className="text-2xl font-bold">
                  {data.recoveryScore !== null ? `${data.recoveryScore}%` : '--'}
                </p>
                <p className={cn('text-sm font-medium', tc.text)}>{tc.label} Recovery</p>
              </div>
            </div>

            {/* Center: Today's workout */}
            <div className="text-left sm:text-center">
              <div className="flex items-center gap-2 sm:justify-center">
                <h1 className="text-lg font-bold">{todaysPlan.title}</h1>
                <Badge className={cn('border-0', badge.className)}>{badge.label}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground sm:justify-center">
                <Clock className="h-3.5 w-3.5" />
                <span>{todaysPlan.duration}</span>
              </div>
            </div>

            {/* Right: Phase + Week */}
            <div className="text-left sm:text-right">
              <p className="text-sm font-semibold">Phase {phase}</p>
              <p className="text-sm text-muted-foreground">Week {currentWeek}</p>
            </div>
          </div>

          {/* Recovery adjustment banner */}
          {recoveryAdjustment.severity !== 'none' && (
            <div className={cn(
              'mt-4 flex items-start gap-2 rounded-lg border p-3',
              severityStyles[recoveryAdjustment.severity].bg,
              severityStyles[recoveryAdjustment.severity].border,
            )}>
              <AlertTriangle className={cn('mt-0.5 h-4 w-4 shrink-0', severityStyles[recoveryAdjustment.severity].icon)} />
              <p className="text-sm">{recoveryAdjustment.message}</p>
            </div>
          )}

          {/* Deload banner */}
          {deload && recoveryAdjustment.severity === 'none' && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 p-3">
              <Timer className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
              <p className="text-sm">Deload week -- reduce load ~40%, fewer sets. Focus on recovery.</p>
            </div>
          )}

          {/* Quick actions */}
          <div className="mt-4 flex flex-wrap gap-4">
            <Link
              href="/routines/schedule"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View full schedule <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {!data.hasCheckedIn && (
              <Link
                href="/routines/check-in"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Check in <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── TESTING WEEK BANNER (deload weeks only) ─── */}
      {deload && <TestingWeekBanner />}

      {/* ─── WEEK-AT-A-GLANCE STRIP ─── */}
      <Card>
        <CardContent className="py-3">
          <div className="flex gap-2">
            {weekSchedule.map((day) => {
              const isToday = day.dayIndex === todayIndex;
              const dayBadge = typeBadge[day.type];
              return (
                <div
                  key={day.dayIndex}
                  className={cn(
                    'flex-1 rounded-lg p-2 text-center transition-colors',
                    isToday && 'ring-2 ring-primary bg-muted/50'
                  )}
                >
                  <p className="text-xs font-medium">{day.label.slice(0, 3)}</p>
                  <div className={cn(
                    'mx-auto mt-1 h-2 w-2 rounded-full',
                    dayBadge.className.replace(/text-\S+/g, '')
                  )} />
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{day.dayLabel}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── TWO-COLUMN BOTTOM SECTION ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left column: Today's Exercises (~60%) */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Today&apos;s Exercises</CardTitle>
              {recoveryAdjustment.skipExercises.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {recoveryAdjustment.skipExercises.length} skipped
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Warm-up */}
            {todaysPlan.warmUp.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Warm-Up
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {todaysPlan.warmUp.map((w) => (
                    <span key={w.name}>
                      {w.name} <span className="text-foreground/70">({w.prescription})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Exercise table */}
            {activeExercises.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="pb-2 pr-2">#</th>
                      <th className="pb-2 pr-2">Exercise</th>
                      <th className="pb-2 pr-2">Sets</th>
                      <th className="pb-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeExercises.map((ex, i) => (
                      <tr key={ex.name} className="border-b border-border/50 last:border-0">
                        <td className="py-2 pr-2 text-muted-foreground">{i + 1}</td>
                        <td className="py-2 pr-2 font-medium">{ex.name}</td>
                        <td className="py-2 pr-2 whitespace-nowrap">{ex.sets}</td>
                        <td className="py-2 text-xs text-muted-foreground max-w-[200px] truncate">
                          {ex.notes || '\u2014'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Protocol card for rest/mobility days */}
            {todaysPlan.exercises.length === 0 && todaysPlan.notes && (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Protocol
                </p>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{todaysPlan.notes}</pre>
              </div>
            )}

            {/* Notes below exercises */}
            {activeExercises.length > 0 && todaysPlan.notes && (
              <p className="text-sm text-muted-foreground italic">{todaysPlan.notes}</p>
            )}

            {/* HR Zones if available */}
            {todaysPlan.hrZones && todaysPlan.hrZones.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Heart Rate Zones
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {todaysPlan.hrZones.map((zone) => (
                    <div key={zone.zone} className="rounded-lg bg-muted/50 p-2 text-center">
                      <p className="text-xs text-muted-foreground">Zone {zone.zone}</p>
                      <p className="text-sm font-semibold">{zone.targetMinutes} min</p>
                      <p className="text-[10px] text-muted-foreground">{zone.bpmRange} bpm</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column: Quick Stats (~40%) */}
        <div className="space-y-4 lg:col-span-2">
          {/* Recovery */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn('h-3 w-3 rounded-full', tc.bg)} />
                  <span className="text-sm font-medium">Recovery</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">
                    {data.recoveryScore !== null ? `${data.recoveryScore}%` : '--'}
                  </span>
                  <p className={cn('text-xs', tc.text)}>{tc.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weight */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Weight</span>
                </div>
                <span className="text-lg font-bold">
                  {data.currentWeight !== null ? formatWeight(data.currentWeight, 'kg') : '--'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* HRV */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">HRV (7d avg)</span>
                </div>
                <span className="text-lg font-bold">
                  {data.avgHRV !== null ? `${data.avgHRV} ms` : '--'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Focus Targets */}
          {data.spotlightTargets.length > 0 && (
            <Card>
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Focus Targets</span>
                  </div>
                  <Link href="/objectives" className="text-xs font-medium text-primary hover:underline">
                    View all
                  </Link>
                </div>
                {data.spotlightTargets.map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-[140px]">{t.domain}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={t.progress} className="h-1.5 w-16" />
                      <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                        {t.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Workouts This Week */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Workouts this week</span>
                </div>
                <span className="text-lg font-bold">{data.workoutsThisWeek}/5</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Nav */}
          <Card>
            <CardContent className="pt-4 pb-4 space-y-2">
              <Link
                href="/objectives"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <Flag className="h-3.5 w-3.5" /> Objectives <ArrowRight className="ml-auto h-3.5 w-3.5" />
              </Link>
              <Link
                href="/routines"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <CalendarCheck className="h-3.5 w-3.5" /> Routines <ArrowRight className="ml-auto h-3.5 w-3.5" />
              </Link>
              <Link
                href="/vitals"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <Activity className="h-3.5 w-3.5" /> Vitals <ArrowRight className="ml-auto h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

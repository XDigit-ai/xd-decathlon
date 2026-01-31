import { createClient, DEV_USER_ID } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Heart, Moon, Scale, Wind, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/date';
import { formatWeight } from '@/lib/utils/format';
import Link from 'next/link';

async function getVitalsOverview(userId: string) {
  const supabase = await createClient();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [recoveryResult, recoveryTrend, profileResult, weightResult, vo2Result] = await Promise.all([
    // Latest recovery
    supabase
      .from('whoop_recovery')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
    // 7-day recovery trend
    supabase
      .from('whoop_recovery')
      .select('recovery_score, hrv, resting_hr, date, traffic_light')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7),
    // Profile baselines
    supabase
      .from('profiles')
      .select('hrv_baseline, resting_hr')
      .eq('id', userId)
      .maybeSingle(),
    // Latest weight + 30-day trend
    supabase
      .from('daily_weight')
      .select('weight_kg, date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30),
    // VO2 max entries
    supabase
      .from('vo2max_entries')
      .select('value, date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const recovery = recoveryResult.data;
  const trend = recoveryTrend.data || [];
  const profile = profileResult.data;
  const weights = weightResult.data || [];
  const vo2 = vo2Result.data;

  // Calculate 7-day averages
  const avgHRV = trend.length > 0
    ? Math.round(trend.reduce((sum, r) => sum + (r.hrv || 0), 0) / trend.length)
    : null;
  const avgRHR = trend.length > 0
    ? Math.round(trend.reduce((sum, r) => sum + (r.resting_hr || 0), 0) / trend.length)
    : null;
  const avgRecovery = trend.length > 0
    ? Math.round(trend.reduce((sum, r) => sum + (r.recovery_score || 0), 0) / trend.length)
    : null;

  // Weight trend
  const currentWeight = weights[0]?.weight_kg ?? null;
  let weightTrend: 'up' | 'down' | 'flat' = 'flat';
  if (weights.length >= 2) {
    const diff = weights[0].weight_kg - weights[weights.length - 1].weight_kg;
    if (Math.abs(diff) < 0.5) weightTrend = 'flat';
    else weightTrend = diff > 0 ? 'up' : 'down';
  }

  return {
    recoveryScore: recovery?.recovery_score ?? null,
    trafficLight: (recovery?.traffic_light ?? 'green') as 'green' | 'yellow' | 'red',
    recoveryDate: recovery?.date ?? null,
    hrv: recovery?.hrv ?? null,
    rhr: recovery?.resting_hr ?? null,
    avgHRV,
    avgRHR,
    avgRecovery,
    hrvBaseline: profile?.hrv_baseline ?? null,
    rhrBaseline: profile?.resting_hr ?? null,
    currentWeight,
    weightTrend,
    weightDate: weights[0]?.date ?? null,
    vo2Max: vo2?.value ?? null,
    vo2Date: vo2?.date ?? null,
  };
}

export default async function VitalsOverviewPage() {
  const userId = DEV_USER_ID;
  const vitals = await getVitalsOverview(userId);

  const trafficColors = {
    green: { bg: 'bg-emerald-500', text: 'text-emerald-500', label: 'Optimal' },
    yellow: { bg: 'bg-amber-500', text: 'text-amber-500', label: 'Moderate' },
    red: { bg: 'bg-rose-500', text: 'text-rose-500', label: 'Low' },
  };
  const tc = trafficColors[vitals.trafficLight];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Health Overview</h1>
        <p className="mt-2 text-muted-foreground">
          Your key health metrics at a glance
        </p>
      </div>

      {/* Recovery Snapshot */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-bold">Recovery</CardTitle>
          <Link href="/vitals/recovery" className="text-xs font-medium text-primary hover:underline">
            View details
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className={cn("h-4 w-4 rounded-full", tc.bg)} />
              <div>
                <span className="text-3xl font-bold">
                  {vitals.recoveryScore !== null ? `${vitals.recoveryScore}%` : '--'}
                </span>
                <Badge variant="outline" className={cn("ml-2", tc.text)}>
                  {tc.label}
                </Badge>
              </div>
            </div>
            {vitals.avgRecovery !== null && (
              <div className="text-sm text-muted-foreground">
                7-day avg: <strong>{vitals.avgRecovery}%</strong>
              </div>
            )}
          </div>
          {vitals.recoveryDate && (
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {formatDate(vitals.recoveryDate)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cardiac Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">HRV</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vitals.hrv ?? '--'} <span className="text-sm font-normal text-muted-foreground">ms</span></div>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              {vitals.avgHRV !== null && <span>7-day avg: {vitals.avgHRV} ms</span>}
              {vitals.hrvBaseline !== null && <span>Baseline: {vitals.hrvBaseline} ms</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resting Heart Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vitals.rhr ?? '--'} <span className="text-sm font-normal text-muted-foreground">bpm</span></div>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              {vitals.avgRHR !== null && <span>7-day avg: {vitals.avgRHR} bpm</span>}
              {vitals.rhrBaseline !== null && <span>Baseline: {vitals.rhrBaseline} bpm</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Body & Cardio Fitness */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vitals.currentWeight !== null ? formatWeight(vitals.currentWeight, 'kg') : '--'}
            </div>
            {vitals.weightDate && (
              <p className="text-xs text-muted-foreground mt-1">
                as of {formatDate(vitals.weightDate)}
              </p>
            )}
            <Link href="/vitals/body" className="text-xs font-medium text-primary hover:underline mt-2 inline-block">
              View body trends
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">VO2 Max</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vitals.vo2Max !== null ? `${vitals.vo2Max}` : '--'}
              <span className="text-sm font-normal text-muted-foreground ml-1">ml/kg/min</span>
            </div>
            {vitals.vo2Date && (
              <p className="text-xs text-muted-foreground mt-1">
                as of {formatDate(vitals.vo2Date)}
              </p>
            )}
            <Link href="/vitals/cardio" className="text-xs font-medium text-primary hover:underline mt-2 inline-block">
              View cardio details
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { href: '/vitals/recovery', icon: Moon, title: 'Recovery & Sleep', desc: 'Detailed recovery data' },
          { href: '/vitals/cardio', icon: Heart, title: 'Cardio & VO2', desc: 'Heart rate zones & fitness' },
          { href: '/vitals/body', icon: Scale, title: 'Body Trends', desc: 'Weight, measurements, DEXA' },
        ].map(({ href, icon: Icon, title, desc }) => (
          <Link key={href} href={href}>
            <Card className="group cursor-pointer transition-all hover:shadow-md">
              <CardContent className="flex items-center justify-between pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

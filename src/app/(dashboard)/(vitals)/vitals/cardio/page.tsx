import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/supabase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Vo2EntryForm } from '@/components/dashboard/vo2-entry-form';
import { Activity, Heart, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

interface CardioData {
  // VO2 Max
  vo2Max: number | null;
  vo2Date: string | null;
  vo2Source: string | null;
  vo2Trend: number | null;
  vo2History: Array<{ date: string; value: number; source: string }>;
  // Heart Rate Zones (from Whoop workouts this week)
  weeklyZoneMinutes: {
    zone1: number;
    zone2: number;
    zone3: number;
    zone4: number;
    zone5: number;
  };
  // Daily strain (from Whoop cycles)
  avgWeeklyStrain: number | null;
  todayStrain: number | null;
}

async function getCardioData(userId: string): Promise<CardioData> {
  const supabase = await createClient();

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [vo2Result, whoopWorkoutsResult, whoopCyclesResult] = await Promise.all([
    // VO2 max entries (last 10)
    supabase
      .from('vo2max_entries')
      .select('date, value, source')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10),

    // Whoop workouts this week (for zone minutes)
    supabase
      .from('whoop_workouts')
      .select('zone1_minutes, zone2_minutes, zone3_minutes, zone4_minutes, zone5_minutes, date')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false }),

    // Whoop cycles this week (for strain)
    supabase
      .from('whoop_cycles')
      .select('strain, date')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false }),
  ]);

  // Process VO2 data
  const vo2Entries = vo2Result.data || [];
  const latestVo2 = vo2Entries[0] ?? null;
  const previousVo2 = vo2Entries[1] ?? null;
  const vo2Trend = latestVo2 && previousVo2 ? latestVo2.value - previousVo2.value : null;

  // Aggregate weekly zone minutes from Whoop workouts
  const workouts = whoopWorkoutsResult.data || [];
  const weeklyZoneMinutes = workouts.reduce(
    (acc, w) => ({
      zone1: acc.zone1 + (w.zone1_minutes || 0),
      zone2: acc.zone2 + (w.zone2_minutes || 0),
      zone3: acc.zone3 + (w.zone3_minutes || 0),
      zone4: acc.zone4 + (w.zone4_minutes || 0),
      zone5: acc.zone5 + (w.zone5_minutes || 0),
    }),
    { zone1: 0, zone2: 0, zone3: 0, zone4: 0, zone5: 0 }
  );

  // Process strain data
  const cycles = whoopCyclesResult.data || [];
  const todayCycle = cycles.find((c) => c.date === today.toISOString().split('T')[0]);
  const avgWeeklyStrain =
    cycles.length > 0
      ? cycles.reduce((sum, c) => sum + (c.strain || 0), 0) / cycles.length
      : null;

  return {
    vo2Max: latestVo2?.value ?? null,
    vo2Date: latestVo2?.date ?? null,
    vo2Source: latestVo2?.source ?? null,
    vo2Trend,
    vo2History: vo2Entries,
    weeklyZoneMinutes,
    avgWeeklyStrain: avgWeeklyStrain ? Math.round(avgWeeklyStrain * 10) / 10 : null,
    todayStrain: todayCycle?.strain ?? null,
  };
}

function getVo2Category(vo2: number): { label: string; color: string } {
  // Based on general population standards for adults
  if (vo2 >= 50) return { label: 'Excellent', color: 'text-green-600' };
  if (vo2 >= 40) return { label: 'Good', color: 'text-blue-600' };
  if (vo2 >= 35) return { label: 'Average', color: 'text-yellow-600' };
  return { label: 'Below Average', color: 'text-red-600' };
}

function formatSource(source: string): string {
  const labels: Record<string, string> = {
    lab_test: 'Lab Test',
    watch: 'Smartwatch',
    whoop: 'Whoop',
    calculated: 'Field Test',
    manual: 'Manual',
  };
  return labels[source] || source;
}

export default async function CardioPage() {
  const user = await getAuthUser();
  const cardio = await getCardioData(user.id);

  const totalZoneMinutes =
    cardio.weeklyZoneMinutes.zone1 +
    cardio.weeklyZoneMinutes.zone2 +
    cardio.weeklyZoneMinutes.zone3 +
    cardio.weeklyZoneMinutes.zone4 +
    cardio.weeklyZoneMinutes.zone5;

  // Zone 2 target: 180 min/week (Peter Attia recommendation)
  const zone2Target = 180;
  const zone2Progress = Math.min((cardio.weeklyZoneMinutes.zone2 / zone2Target) * 100, 100);

  // HIIT (Zone 4+5) target: 30 min/week
  const hiitMinutes = cardio.weeklyZoneMinutes.zone4 + cardio.weeklyZoneMinutes.zone5;
  const hiitTarget = 30;
  const hiitProgress = Math.min((hiitMinutes / hiitTarget) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cardio & VO2 Max</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your cardiovascular fitness and training zones
          </p>
        </div>
        <Vo2EntryForm />
      </div>

      {/* VO2 Max Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-bold">VO2 Max</CardTitle>
          <Activity className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {cardio.vo2Max !== null ? (
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">{cardio.vo2Max}</span>
                <span className="text-lg text-muted-foreground">ml/kg/min</span>
                {cardio.vo2Trend !== null && (
                  <div
                    className={cn(
                      'flex items-center gap-1 text-sm font-medium',
                      cardio.vo2Trend > 0
                        ? 'text-green-600'
                        : cardio.vo2Trend < 0
                        ? 'text-red-600'
                        : 'text-gray-500'
                    )}
                  >
                    {cardio.vo2Trend > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : cardio.vo2Trend < 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                    {cardio.vo2Trend > 0 ? '+' : ''}
                    {cardio.vo2Trend.toFixed(1)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className={getVo2Category(cardio.vo2Max).color}>
                  {getVo2Category(cardio.vo2Max).label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  via {formatSource(cardio.vo2Source || 'manual')}
                </span>
              </div>

              {cardio.vo2Date && (
                <p className="text-xs text-muted-foreground">
                  Last recorded: {formatDate(cardio.vo2Date)}
                </p>
              )}

              {/* VO2 History */}
              {cardio.vo2History.length > 1 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Recent History</p>
                  <div className="space-y-2">
                    {cardio.vo2History.slice(0, 5).map((entry, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {formatDate(entry.date)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.value}</span>
                          <Badge variant="secondary" className="text-xs">
                            {formatSource(entry.source)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No VO2 Max data yet</p>
              <p className="text-sm text-muted-foreground">
                Log your VO2 max from a lab test, smartwatch, or field test
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Zones */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Zone 2 Training */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zone 2 (Aerobic Base)</CardTitle>
            <Heart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {cardio.weeklyZoneMinutes.zone2} min
            </div>
            <Progress value={zone2Progress} className="h-2 mb-2" />
            <p className="text-sm text-muted-foreground">
              {zone2Progress >= 100
                ? 'Weekly target reached!'
                : `${zone2Target - cardio.weeklyZoneMinutes.zone2} min to weekly target`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Target: {zone2Target} min/week
            </p>
          </CardContent>
        </Card>

        {/* HIIT Training */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HIIT (Zone 4+5)</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {hiitMinutes} min
            </div>
            <Progress value={hiitProgress} className="h-2 mb-2" />
            <p className="text-sm text-muted-foreground">
              {hiitProgress >= 100
                ? 'Weekly target reached!'
                : `${hiitTarget - hiitMinutes} min to weekly target`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Target: {hiitTarget} min/week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Heart Rate Zone Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Heart Rate Zones</CardTitle>
        </CardHeader>
        <CardContent>
          {totalZoneMinutes > 0 ? (
            <div className="space-y-4">
              {[
                { zone: 'Zone 1', minutes: cardio.weeklyZoneMinutes.zone1, color: 'bg-gray-400', desc: 'Very Light' },
                { zone: 'Zone 2', minutes: cardio.weeklyZoneMinutes.zone2, color: 'bg-green-500', desc: 'Light (Fat Burn)' },
                { zone: 'Zone 3', minutes: cardio.weeklyZoneMinutes.zone3, color: 'bg-yellow-500', desc: 'Moderate' },
                { zone: 'Zone 4', minutes: cardio.weeklyZoneMinutes.zone4, color: 'bg-orange-500', desc: 'Hard' },
                { zone: 'Zone 5', minutes: cardio.weeklyZoneMinutes.zone5, color: 'bg-red-500', desc: 'Maximum' },
              ].map(({ zone, minutes, color, desc }) => (
                <div key={zone} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium">{zone}</div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', color)}
                        style={{ width: `${(minutes / totalZoneMinutes) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right">
                    <span className="font-medium">{minutes}</span>
                    <span className="text-sm text-muted-foreground ml-1">min</span>
                  </div>
                  <div className="w-28 text-xs text-muted-foreground hidden sm:block">
                    {desc}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t flex justify-between text-sm">
                <span className="text-muted-foreground">Total training time this week</span>
                <span className="font-medium">{totalZoneMinutes} minutes</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No workout zone data this week</p>
              <p className="text-sm text-muted-foreground mt-1">
                Zone data is synced from Whoop workouts
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Strain */}
      {(cardio.todayStrain !== null || cardio.avgWeeklyStrain !== null) && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Strain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today</p>
                <div className="text-3xl font-bold">
                  {cardio.todayStrain !== null ? cardio.todayStrain.toFixed(1) : '--'}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">7-day Average</p>
                <div className="text-3xl font-bold">
                  {cardio.avgWeeklyStrain !== null ? cardio.avgWeeklyStrain.toFixed(1) : '--'}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Strain scale: 0-21 (from Whoop)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

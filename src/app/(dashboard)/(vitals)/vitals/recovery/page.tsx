import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/supabase/auth';
import { RecoveryStatus } from '@/components/dashboard/recovery-status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Heart, Moon, TrendingUp, Link as LinkIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

async function getRecoveryData(userId: string) {
  const supabase = await createClient();

  const [latestRecovery, recoveryTrend, profileData] = await Promise.all([
    // Latest recovery data
    supabase
      .from('whoop_recovery')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Recovery trend (last 7 days)
    supabase
      .from('whoop_recovery')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7),

    // Profile for baselines
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(),
  ]);

  return {
    latest: latestRecovery.data,
    trend: recoveryTrend.data || [],
    profile: profileData.data,
  };
}

export default async function RecoveryPage() {
  const user = await getAuthUser();

  const recoveryData = await getRecoveryData(user.id);
  const hasWhoopData = !!recoveryData.latest;

  // Determine recovery status
  const recoveryScore = recoveryData.latest?.recovery_score || 0;
  const trafficLight = (recoveryData.latest?.traffic_light || 'green') as 'green' | 'yellow' | 'red';
  const hrv = recoveryData.latest?.hrv || recoveryData.profile?.hrv_baseline || 0;
  const rhr = recoveryData.latest?.resting_hr || recoveryData.profile?.resting_hr || 0;

  let recoveryMessage = 'Train as planned';
  if (trafficLight === 'yellow') {
    recoveryMessage = 'Consider lighter training';
  } else if (trafficLight === 'red') {
    recoveryMessage = 'Prioritize recovery';
  }

  // Calculate trend metrics
  const avgRecovery = recoveryData.trend.length > 0
    ? Math.round(
        recoveryData.trend.reduce((sum, r) => sum + (r.recovery_score || 0), 0) / recoveryData.trend.length
      )
    : 0;

  const avgHRV = recoveryData.trend.length > 0
    ? Math.round(
        recoveryData.trend.reduce((sum, r) => sum + (r.hrv || 0), 0) / recoveryData.trend.length
      )
    : 0;

  const avgRHR = recoveryData.trend.length > 0
    ? Math.round(
        recoveryData.trend.reduce((sum, r) => sum + (r.resting_hr || 0), 0) / recoveryData.trend.length
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recovery Status</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your recovery metrics and readiness to train
        </p>
      </div>

      {!hasWhoopData ? (
        /* Empty state - No Whoop data */
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-purple-100 p-4 mb-4">
              <LinkIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Connect Your Whoop Account</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Connect your Whoop account to automatically sync recovery, sleep, and strain data.
              This will help you optimize your training based on your body's readiness.
            </p>
            <Button asChild>
              <a href="/settings">Go to Settings</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Recovery Status */}
          <RecoveryStatus
            status={trafficLight}
            message={recoveryMessage}
            hrv={hrv}
            rhr={rhr}
            sleepHours={0}
          />

          {/* Recovery Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recovery Score</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recoveryScore}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  7-day avg: {avgRecovery}%
                </p>
                {recoveryData.latest?.date && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {formatDate(recoveryData.latest.date)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">HRV</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrv}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  7-day avg: {avgHRV} ms
                </p>
                {recoveryData.profile?.hrv_baseline && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Baseline: {recoveryData.profile.hrv_baseline} ms
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resting HR</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rhr}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  7-day avg: {avgRHR} bpm
                </p>
                {recoveryData.profile?.resting_hr && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Baseline: {recoveryData.profile.resting_hr} bpm
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Recovery Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Recovery Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {recoveryData.trend.length > 0 ? (
                <div className="space-y-3">
                  {recoveryData.trend.map((recovery) => (
                    <div
                      key={recovery.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            recovery.traffic_light === 'green'
                              ? 'bg-green-500'
                              : recovery.traffic_light === 'yellow'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <div>
                          <div className="text-sm font-medium">
                            {formatDate(recovery.date)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            HRV: {recovery.hrv || '--'} ms, RHR: {recovery.resting_hr || '--'} bpm
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{recovery.recovery_score}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recovery trend data available yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Training Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle>Training Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge
                  variant={
                    trafficLight === 'green'
                      ? 'default'
                      : trafficLight === 'yellow'
                      ? 'secondary'
                      : 'destructive'
                  }
                  className="mt-1"
                >
                  {trafficLight.toUpperCase()}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm">
                    {trafficLight === 'green' && (
                      <>
                        Your recovery is optimal. This is a great day for high-intensity training or
                        pushing for personal records. Your body is ready to perform.
                      </>
                    )}
                    {trafficLight === 'yellow' && (
                      <>
                        Your recovery is moderate. Consider lighter training today or focus on
                        technique and skill work. Listen to your body and avoid maximal efforts.
                      </>
                    )}
                    {trafficLight === 'red' && (
                      <>
                        Your recovery is low. Prioritize rest and recovery today. Consider active
                        recovery, mobility work, or take a complete rest day. High-intensity training
                        is not recommended.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

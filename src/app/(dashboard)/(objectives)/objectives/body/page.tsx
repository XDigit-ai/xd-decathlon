import { createClient, DEV_USER_ID } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Scale, TrendingDown, TrendingUp, Minus, ArrowRight } from 'lucide-react';
import { formatWeight, formatPercentage } from '@/lib/utils/format';
import Link from 'next/link';

interface BodyGoals {
  currentWeight: number | null;
  targetWeight: number | null;
  baselineWeight: number | null;
  weightProgress: number;
  weightTrend: 'up' | 'down' | 'flat';
  recentWeightChange: number | null;
  currentBodyFat: number | null;
  targetBodyFat: number | null;
  baselineBodyFat: number | null;
  bodyFatProgress: number;
  latestDate: string | null;
}

async function getBodyGoals(userId: string): Promise<BodyGoals> {
  const supabase = await createClient();

  const [weightData, targetData] = await Promise.all([
    // Latest weight entries (last 7 for trend)
    supabase
      .from('daily_weight')
      .select('weight_kg, body_fat_pct, date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7),
    // Body composition targets
    supabase
      .from('targets')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .in('domain', ['weight', 'body_fat', 'body_weight', 'body_fat_pct']),
  ]);

  const weights = weightData.data || [];
  const targets = targetData.data || [];

  const currentWeight = weights[0]?.weight_kg ?? null;
  const currentBodyFat = weights[0]?.body_fat_pct ?? null;
  const latestDate = weights[0]?.date ?? null;

  // Weight trend
  let weightTrend: 'up' | 'down' | 'flat' = 'flat';
  let recentWeightChange: number | null = null;
  if (weights.length >= 2) {
    const diff = weights[0].weight_kg - weights[weights.length - 1].weight_kg;
    recentWeightChange = diff;
    if (Math.abs(diff) < 0.3) weightTrend = 'flat';
    else weightTrend = diff > 0 ? 'up' : 'down';
  }

  // Find weight target
  const weightTarget = targets.find(t => t.domain === 'weight' || t.domain === 'body_weight');
  const fatTarget = targets.find(t => t.domain === 'body_fat' || t.domain === 'body_fat_pct');

  const targetWeight = weightTarget?.target_12m ?? weightTarget?.target_6m ?? weightTarget?.target_3m ?? null;
  const baselineWeight = weightTarget?.baseline ?? null;
  const targetBodyFat = fatTarget?.target_12m ?? fatTarget?.target_6m ?? fatTarget?.target_3m ?? null;
  const baselineBodyFat = fatTarget?.baseline ?? null;

  // Calculate progress
  let weightProgress = 0;
  if (baselineWeight !== null && targetWeight !== null && currentWeight !== null) {
    const total = targetWeight - baselineWeight;
    if (total !== 0) {
      weightProgress = Math.max(0, Math.min(100, ((currentWeight - baselineWeight) / total) * 100));
    }
  }

  let bodyFatProgress = 0;
  if (baselineBodyFat !== null && targetBodyFat !== null && currentBodyFat !== null) {
    const total = targetBodyFat - baselineBodyFat;
    if (total !== 0) {
      bodyFatProgress = Math.max(0, Math.min(100, ((currentBodyFat - baselineBodyFat) / total) * 100));
    }
  }

  return {
    currentWeight,
    targetWeight,
    baselineWeight,
    weightProgress: Math.round(weightProgress),
    weightTrend,
    recentWeightChange,
    currentBodyFat,
    targetBodyFat,
    baselineBodyFat,
    bodyFatProgress: Math.round(bodyFatProgress),
    latestDate,
  };
}

export default async function BodyGoalsPage() {
  const userId = DEV_USER_ID;
  const goals = await getBodyGoals(userId);

  const hasData = goals.currentWeight !== null || goals.currentBodyFat !== null;

  const TrendIcon = goals.weightTrend === 'up' ? TrendingUp
    : goals.weightTrend === 'down' ? TrendingDown
    : Minus;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Body Composition Goals</h1>
        <p className="mt-2 text-muted-foreground">
          Track your weight and body fat against targets
        </p>
      </div>

      {!hasData ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Scale className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Body Data Yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              Log your weight and body fat to start tracking progress.
            </p>
            <Link
              href="/vitals/body"
              className="text-sm font-medium text-primary hover:underline"
            >
              Go to Body Trends
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Weight Goal */}
          <Card className="group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-bold">Weight</CardTitle>
              <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                <Scale className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-bold tracking-tight">
                    {goals.currentWeight !== null ? formatWeight(goals.currentWeight, 'kg') : '--'}
                  </span>
                  {goals.latestDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      as of {new Date(goals.latestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
                {goals.recentWeightChange !== null && (
                  <div className="flex items-center gap-1">
                    <TrendIcon className={`h-4 w-4 ${
                      goals.weightTrend === 'down' ? 'text-green-500' : goals.weightTrend === 'up' ? 'text-red-500' : 'text-muted-foreground'
                    }`} />
                    <span className={`text-sm font-medium ${
                      goals.weightTrend === 'down' ? 'text-green-500' : goals.weightTrend === 'up' ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                      {goals.recentWeightChange > 0 ? '+' : ''}
                      {goals.recentWeightChange.toFixed(1)} kg
                    </span>
                  </div>
                )}
              </div>

              {goals.targetWeight !== null && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {goals.baselineWeight !== null && (
                      <span>{goals.baselineWeight} kg</span>
                    )}
                    <ArrowRight className="h-3 w-3" />
                    <span className="font-medium text-foreground">{goals.targetWeight} kg</span>
                  </div>
                  <Progress value={goals.weightProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">{goals.weightProgress}% to target</p>
                </div>
              )}

              <Link
                href="/vitals/body"
                className="text-xs font-medium text-primary hover:underline"
              >
                View detailed trends
              </Link>
            </CardContent>
          </Card>

          {/* Body Fat Goal */}
          <Card className="group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-bold">Body Fat</CardTitle>
              <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                <TrendingDown className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <span className="text-3xl font-bold tracking-tight">
                  {goals.currentBodyFat !== null ? formatPercentage(goals.currentBodyFat) : '--'}
                </span>
                {goals.latestDate && goals.currentBodyFat !== null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    as of {new Date(goals.latestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>

              {goals.targetBodyFat !== null && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {goals.baselineBodyFat !== null && (
                      <span>{goals.baselineBodyFat}%</span>
                    )}
                    <ArrowRight className="h-3 w-3" />
                    <span className="font-medium text-foreground">{goals.targetBodyFat}%</span>
                  </div>
                  <Progress value={goals.bodyFatProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">{goals.bodyFatProgress}% to target</p>
                </div>
              )}

              <Link
                href="/vitals/body"
                className="text-xs font-medium text-primary hover:underline"
              >
                View detailed trends
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

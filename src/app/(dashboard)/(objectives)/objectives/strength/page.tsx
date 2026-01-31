import { createClient, DEV_USER_ID } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, TrendingUp, Trophy } from 'lucide-react';
import type { Target } from '@/types/database';

interface LiftGoal {
  name: string;
  exerciseTemplateId: string | null;
  current1RM: number | null;
  baseline: number | null;
  target3m: number | null;
  target6m: number | null;
  target12m: number | null;
  progress: number;
  recentPRs: Array<{
    value: number;
    date: string;
  }>;
}

const KEY_LIFTS = ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press', 'Barbell Row'];

async function getStrengthGoals(userId: string): Promise<LiftGoal[]> {
  const supabase = await createClient();

  // Fetch strength-related targets
  const { data: targets } = await supabase
    .from('targets')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .in('domain', [
      'squat_1rm', 'bench_1rm', 'deadlift_1rm', 'ohp_1rm', 'row_1rm',
      'squat', 'bench', 'deadlift', 'overhead_press', 'barbell_row',
    ]);

  const goals: LiftGoal[] = [];

  for (const liftName of KEY_LIFTS) {
    // Find matching target
    const target = targets?.find(t => {
      const domain = t.domain.toLowerCase();
      const name = liftName.toLowerCase().replace(/\s+/g, '_');
      return domain.includes(name);
    });

    // Get latest 1RM
    const { data: latestRM } = await supabase
      .from('estimated_1rm')
      .select('estimated_1rm_kg, date, exercise_template_id, exercise_templates!inner(title)')
      .ilike('exercise_templates.title', `%${liftName}%`)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get recent PRs for this lift
    const prs: Array<{ value: number; date: string }> = [];
    if (latestRM?.exercise_template_id) {
      const { data: prData } = await supabase
        .from('personal_records')
        .select('value, date')
        .eq('exercise_template_id', latestRM.exercise_template_id)
        .eq('record_type', '1rm')
        .order('date', { ascending: false })
        .limit(3);

      if (prData) {
        prs.push(...prData.map(p => ({ value: p.value, date: p.date })));
      }
    }

    const current = latestRM?.estimated_1rm_kg ?? target?.current_value ?? null;
    const baseline = target?.baseline ?? null;
    const target12m = target?.target_12m ?? target?.target_6m ?? target?.target_3m ?? null;

    let progress = 0;
    if (baseline !== null && target12m !== null && current !== null) {
      const totalChange = target12m - baseline;
      if (totalChange !== 0) {
        progress = Math.max(0, Math.min(100, ((current - baseline) / totalChange) * 100));
      }
    }

    goals.push({
      name: liftName,
      exerciseTemplateId: latestRM?.exercise_template_id ?? null,
      current1RM: current,
      baseline,
      target3m: target?.target_3m ?? null,
      target6m: target?.target_6m ?? null,
      target12m: target?.target_12m ?? null,
      progress: Math.round(progress),
      recentPRs: prs,
    });
  }

  return goals;
}

export default async function StrengthGoalsPage() {
  const userId = DEV_USER_ID;
  const goals = await getStrengthGoals(userId);

  const hasAnyData = goals.some(g => g.current1RM !== null || g.baseline !== null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Strength Goals</h1>
        <p className="mt-2 text-muted-foreground">
          Track your key lift 1RM values against targets
        </p>
      </div>

      {!hasAnyData ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Strength Data Yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Set targets for your key lifts and sync workouts from Hevy to track
              your 1RM progression against goals.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Card key={goal.name} className="group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold">{goal.name}</CardTitle>
                <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current 1RM */}
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Current 1RM</span>
                  <span className="text-2xl font-bold tracking-tight">
                    {goal.current1RM !== null
                      ? `${goal.current1RM.toFixed(1)} kg`
                      : '--'}
                  </span>
                </div>

                {/* Progress bar */}
                {(goal.baseline !== null || goal.target12m !== null) && (
                  <div className="space-y-2">
                    <Progress value={goal.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {goal.baseline !== null ? `Baseline: ${goal.baseline} kg` : ''}
                      </span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                  </div>
                )}

                {/* Targets row */}
                {(goal.target3m !== null || goal.target6m !== null || goal.target12m !== null) && (
                  <div className="flex gap-2 flex-wrap">
                    {goal.target3m !== null && (
                      <Badge variant="outline" className="text-xs">
                        3m: {goal.target3m} kg
                      </Badge>
                    )}
                    {goal.target6m !== null && (
                      <Badge variant="outline" className="text-xs">
                        6m: {goal.target6m} kg
                      </Badge>
                    )}
                    {goal.target12m !== null && (
                      <Badge variant="outline" className="text-xs">
                        12m: {goal.target12m} kg
                      </Badge>
                    )}
                  </div>
                )}

                {/* Recent PRs */}
                {goal.recentPRs.length > 0 && (
                  <div className="space-y-1 border-t pt-3">
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Trophy className="h-3 w-3" />
                      <span>Recent PRs</span>
                    </div>
                    {goal.recentPRs.map((pr, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {new Date(pr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="font-medium">{pr.value.toFixed(1)} kg</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

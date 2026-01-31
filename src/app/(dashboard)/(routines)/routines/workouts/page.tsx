/**
 * Strength Training Page
 * Displays workout history, 1RM progression, and personal records
 */

import { Suspense } from 'react';
import { createClient, DEV_USER_ID } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkoutCard } from '@/components/strength/workout-card';
import { PRFeed } from '@/components/strength/pr-feed';
import { Dumbbell, TrendingUp } from 'lucide-react';

interface OneRMData {
  exercise_title: string;
  exercise_template_id: string;
  estimated_1rm_kg: number;
  date: string;
}

async function getRecentWorkouts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('hevy_workouts')
    .select('*')
    .order('start_time', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Failed to fetch workouts:', error);
    return [];
  }

  return data || [];
}

async function getKeyLifts1RM() {
  const supabase = await createClient();

  // Define key lifts to track (you can customize these)
  const keyLifts = [
    'Squat',
    'Bench Press',
    'Deadlift',
    'Overhead Press',
    'Barbell Row',
  ];

  const oneRMs: OneRMData[] = [];

  for (const liftName of keyLifts) {
    // Get the latest 1RM for exercises matching this name
    const { data, error } = await supabase
      .from('estimated_1rm')
      .select(
        `
        estimated_1rm_kg,
        date,
        exercise_template_id,
        exercise_templates!inner(title)
      `
      )
      .ilike('exercise_templates.title', `%${liftName}%`)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      oneRMs.push({
        exercise_title: (data as any).exercise_templates?.title || liftName,
        exercise_template_id: data.exercise_template_id,
        estimated_1rm_kg: data.estimated_1rm_kg,
        date: data.date,
      });
    }
  }

  return oneRMs;
}

async function getRecentPRs() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('personal_records')
    .select(
      `
      id,
      record_type,
      value,
      previous_value,
      date,
      exercise_templates!inner(title)
    `
    )
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Failed to fetch PRs:', error);
    return [];
  }

  return (
    data?.map((pr) => ({
      id: pr.id,
      exercise_title: (pr as any).exercise_templates?.title || 'Unknown Exercise',
      record_type: pr.record_type,
      value: pr.value,
      previous_value: pr.previous_value,
      date: pr.date,
    })) || []
  );
}

function WorkoutsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}

function OneRMSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

export default async function StrengthPage() {
  const userId = DEV_USER_ID;

  // Fetch data in parallel
  const [workouts, oneRMs, prs] = await Promise.all([
    getRecentWorkouts(),
    getKeyLifts1RM(),
    getRecentPRs(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Strength Training</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your 1RM progression, workout history, and personal records
        </p>
      </div>

      {/* Key Lifts 1RM Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Estimated 1RM - Key Lifts</CardTitle>
          </div>
          <CardDescription>Your current estimated one-rep max for major lifts</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<OneRMSkeleton />}>
            {oneRMs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No 1RM data available yet. Complete some workouts to see your estimates.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {oneRMs.map((oneRM) => (
                  <Card key={oneRM.exercise_template_id} className="bg-muted/30">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {oneRM.exercise_title}
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          {oneRM.estimated_1rm_kg.toFixed(1)}
                          <span className="text-lg text-muted-foreground ml-1">kg</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          as of {new Date(oneRM.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>

      {/* Recent Workouts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <CardTitle>Recent Workouts</CardTitle>
          </div>
          <CardDescription>Your latest training sessions from Hevy</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<WorkoutsSkeleton />}>
            {workouts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No workouts synced yet.</p>
                <p className="text-sm mt-1">
                  Workouts from Hevy will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {workouts.map((workout) => (
                  <WorkoutCard
                    key={workout.id}
                    id={workout.id}
                    title={workout.title}
                    date={workout.start_time}
                    duration={workout.duration_seconds}
                    totalVolume={Number(workout.total_volume_kg)}
                    totalSets={workout.total_sets}
                    exerciseCount={
                      (workout.raw_data?.exercises?.length || 0)
                    }
                  />
                ))}
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>

      {/* Personal Records Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Personal Records</CardTitle>
          <CardDescription>Your latest achievements and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <PRFeed records={prs} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

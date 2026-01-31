/**
 * Exercise Detail Page
 * Shows detailed progression, history, and volume trends for a specific exercise
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Calendar, Dumbbell } from 'lucide-react';

interface ExerciseDetailPageProps {
  params: Promise<{
    exerciseId: string;
  }>;
}

interface ExerciseData {
  id: string;
  title: string;
  muscle_group: string | null;
  equipment: string | null;
  latest1RM: number | null;
  oneRMHistory: Array<{
    date: string;
    estimated_1rm_kg: number;
    source_weight_kg: number | null;
    source_reps: number | null;
  }>;
  workoutHistory: Array<{
    workout_id: string;
    workout_title: string;
    workout_date: string;
    sets: Array<{
      set_index: number;
      set_type: string;
      weight_kg: number | null;
      reps: number | null;
      rpe: number | null;
    }>;
  }>;
}

async function getExerciseData(exerciseId: string): Promise<ExerciseData | null> {
  const supabase = await createClient();

  // Get exercise template
  const { data: template, error: templateError } = await supabase
    .from('exercise_templates')
    .select('*')
    .eq('id', exerciseId)
    .single();

  if (templateError || !template) {
    return null;
  }

  // Get latest 1RM
  const { data: latest1RM } = await supabase
    .from('estimated_1rm')
    .select('estimated_1rm_kg')
    .eq('exercise_template_id', exerciseId)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  // Get 1RM history
  const { data: oneRMHistory } = await supabase
    .from('estimated_1rm')
    .select('date, estimated_1rm_kg, source_weight_kg, source_reps')
    .eq('exercise_template_id', exerciseId)
    .order('date', { ascending: false })
    .limit(30);

  // Get workout history with sets
  const { data: workoutExercises } = await supabase
    .from('hevy_workout_exercises')
    .select(
      `
      id,
      hevy_workouts!inner(
        id,
        title,
        started_at
      ),
      hevy_sets(
        set_index,
        set_type,
        weight_kg,
        reps,
        rpe
      )
    `
    )
    .eq('exercise_template_id', exerciseId)
    .order('hevy_workouts.started_at', { ascending: false })
    .limit(20);

  // Transform workout history
  const workoutHistory =
    workoutExercises?.map((we: any) => ({
      workout_id: we.hevy_workouts.id,
      workout_title: we.hevy_workouts.title,
      workout_date: we.hevy_workouts.started_at,
      sets: (we.hevy_sets || [])
        .sort((a: any, b: any) => a.set_index - b.set_index)
        .map((s: any) => ({
          set_index: s.set_index,
          set_type: s.set_type,
          weight_kg: s.weight_kg,
          reps: s.reps,
          rpe: s.rpe,
        })),
    })) || [];

  return {
    id: template.id,
    title: template.title,
    muscle_group: template.muscle_group,
    equipment: template.equipment,
    latest1RM: latest1RM?.estimated_1rm_kg || null,
    oneRMHistory: oneRMHistory || [],
    workoutHistory,
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatSetType(type: string): string {
  switch (type) {
    case 'warmup':
      return 'W';
    case 'failure':
      return 'F';
    case 'drop':
      return 'D';
    default:
      return '';
  }
}

export default async function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  const supabase = await createClient();
  const resolvedParams = await params;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const exerciseData = await getExerciseData(resolvedParams.exerciseId);

  if (!exerciseData) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{exerciseData.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              {exerciseData.muscle_group && (
                <Badge variant="secondary">{exerciseData.muscle_group}</Badge>
              )}
              {exerciseData.equipment && (
                <Badge variant="outline">{exerciseData.equipment}</Badge>
              )}
            </div>
          </div>

          {exerciseData.latest1RM && (
            <Card className="min-w-[160px]">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Current 1RM</p>
                  <p className="text-3xl font-bold text-primary">
                    {exerciseData.latest1RM.toFixed(1)}
                    <span className="text-sm text-muted-foreground ml-1">kg</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 1RM Progression */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>1RM Progression</CardTitle>
          </div>
          <CardDescription>Your estimated one-rep max over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            {exerciseData.oneRMHistory.length === 0 ? (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">
                  No 1RM data available yet. Complete some sets to see your progression.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {exerciseData.oneRMHistory.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{formatDate(record.date)}</p>
                        {record.source_weight_kg && record.source_reps && (
                          <p className="text-xs text-muted-foreground">
                            from {record.source_weight_kg}kg × {record.source_reps} reps
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        {record.estimated_1rm_kg.toFixed(1)} kg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>

      {/* Workout History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <CardTitle>Set History</CardTitle>
          </div>
          <CardDescription>Your recent sets and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            {exerciseData.workoutHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No workout history available yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {exerciseData.workoutHistory.map((workout) => {
                  const totalVolume = workout.sets.reduce(
                    (sum, set) =>
                      sum + (set.weight_kg || 0) * (set.reps || 0),
                    0
                  );

                  return (
                    <div key={workout.workout_id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{workout.workout_title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(workout.workout_date)}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {Math.round(totalVolume)} kg volume
                        </Badge>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                                Set
                              </th>
                              <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                                Weight
                              </th>
                              <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                                Reps
                              </th>
                              <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                                RPE
                              </th>
                              <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                                Volume
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {workout.sets.map((set) => {
                              const setType = formatSetType(set.set_type);
                              const volume =
                                (set.weight_kg || 0) * (set.reps || 0);

                              return (
                                <tr
                                  key={set.set_index}
                                  className="border-b last:border-0"
                                >
                                  <td className="py-2 px-3">
                                    {set.set_index + 1}
                                    {setType && (
                                      <Badge
                                        variant="outline"
                                        className="ml-1 text-xs"
                                      >
                                        {setType}
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 font-medium">
                                    {set.weight_kg ? `${set.weight_kg} kg` : '-'}
                                  </td>
                                  <td className="py-2 px-3 font-medium">
                                    {set.reps || '-'}
                                  </td>
                                  <td className="py-2 px-3">
                                    {set.rpe ? set.rpe.toFixed(1) : '-'}
                                  </td>
                                  <td className="py-2 px-3 text-muted-foreground">
                                    {volume > 0 ? `${volume.toFixed(0)} kg` : '-'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

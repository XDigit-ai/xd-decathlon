"use client";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatDateShort } from "@/lib/utils";
import { Clock, Dumbbell, Trophy } from "lucide-react";

interface WorkoutExercise {
  name: string;
  sets: number;
  bestSet: string;
  hasPR: boolean;
}

interface Workout {
  id: string;
  title: string;
  date: string;
  duration: number;
  volume: number;
  exercises: WorkoutExercise[];
}

interface WorkoutListProps {
  workouts: Workout[];
  onSelectWorkout?: (id: string) => void;
}

export function WorkoutList({ workouts, onSelectWorkout }: WorkoutListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-blue-500" />
          Recent Workouts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {workouts.map((workout) => (
          <div
            key={workout.id}
            className="cursor-pointer rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            onClick={() => onSelectWorkout?.(workout.id)}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {workout.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                  <span>{formatDateShort(workout.date)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.round(workout.duration)} min
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {workout.volume.toLocaleString()} kg
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  total volume
                </p>
              </div>
            </div>

            <div className="space-y-1">
              {workout.exercises.slice(0, 4).map((exercise, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    {exercise.name}
                    {exercise.hasPR && (
                      <Badge variant="success" size="sm">
                        <Trophy className="mr-1 h-3 w-3" />
                        PR
                      </Badge>
                    )}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-500">
                    {exercise.sets}x · {exercise.bestSet}
                  </span>
                </div>
              ))}
              {workout.exercises.length > 4 && (
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  +{workout.exercises.length - 4} more exercises
                </p>
              )}
            </div>
          </div>
        ))}

        {workouts.length === 0 && (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            No workouts recorded yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

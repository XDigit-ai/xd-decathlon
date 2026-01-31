"use client";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatDateShort } from "@/lib/utils";
import type { RecentWorkout } from "@/types";
import { Dumbbell, Trophy } from "lucide-react";
import Link from "next/link";

interface RecentWorkoutsCardProps {
  workouts: RecentWorkout[];
}

export function RecentWorkoutsCard({ workouts }: RecentWorkoutsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-500" />
            Recent Workouts
          </span>
          <Link
            href="/strength"
            className="text-sm font-normal text-blue-500 hover:text-blue-600 dark:text-blue-400"
          >
            View all
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <Dumbbell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {workout.title}
                    </span>
                    {workout.hasPR && (
                      <Badge variant="success" size="sm">
                        <Trophy className="mr-1 h-3 w-3" />
                        PR
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDateShort(workout.date)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {workout.volume.toLocaleString()} kg
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {workout.sets} sets
                </div>
              </div>
            </div>
          ))}

          {workouts.length === 0 && (
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              No workouts this week. Time to hit the gym!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

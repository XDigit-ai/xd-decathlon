"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { WeeklySnapshot } from "@/types";
import { Activity, Bed, Dumbbell, Heart, Scale } from "lucide-react";

interface WeeklySnapshotCardProps {
  snapshot: WeeklySnapshot;
}

export function WeeklySnapshotCard({ snapshot }: WeeklySnapshotCardProps) {
  const metrics = [
    {
      label: "Training",
      value: `${snapshot.sessionsCompleted}/${snapshot.sessionsPlanned}`,
      subtext: "sessions",
      icon: Dumbbell,
      color: "text-blue-500",
    },
    {
      label: "Weight",
      value: snapshot.weightTrend > 0 ? `+${snapshot.weightTrend.toFixed(1)}` : snapshot.weightTrend.toFixed(1),
      subtext: "kg this week",
      icon: Scale,
      color: snapshot.weightTrend <= 0 ? "text-green-500" : "text-yellow-500",
    },
    {
      label: "Avg HRV",
      value: snapshot.avgHrv.toString(),
      subtext: "ms",
      icon: Heart,
      color: "text-red-500",
    },
    {
      label: "Avg Sleep",
      value: (snapshot.avgSleep / 60).toFixed(1),
      subtext: "hours",
      icon: Bed,
      color: "text-purple-500",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="text-center">
                <div className="mb-2 flex justify-center">
                  <div className={`rounded-full bg-zinc-100 p-2 dark:bg-zinc-800 ${metric.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {metric.value}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {metric.label}
                </div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500">
                  {metric.subtext}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

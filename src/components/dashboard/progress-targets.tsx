"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { ProgressTarget } from "@/types";
import { Target } from "lucide-react";

interface ProgressTargetsCardProps {
  targets: ProgressTarget[];
}

export function ProgressTargetsCard({ targets }: ProgressTargetsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-500" />
          Active Targets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {targets.map((target) => (
          <div key={target.id}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {target.metricName}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {target.current} / {target.target} {target.unit}
              </span>
            </div>
            <ProgressBar
              value={target.percentage}
              color={
                target.percentage >= 100
                  ? "green"
                  : target.percentage >= 75
                  ? "blue"
                  : target.percentage >= 50
                  ? "yellow"
                  : "red"
              }
              size="md"
              showValue={false}
            />
          </div>
        ))}

        {targets.length === 0 && (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            No active targets. Set up your goals to start tracking!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

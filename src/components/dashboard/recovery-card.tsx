"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { TrafficLight } from "@/components/ui/traffic-light";
import { getRecoveryStatus } from "@/lib/utils";
import { Heart, TrendingDown, TrendingUp } from "lucide-react";

interface RecoveryCardProps {
  hrv: number;
  baseline: number;
  rhr: number;
  recoveryScore: number;
}

export function RecoveryCard({ hrv, baseline, rhr, recoveryScore }: RecoveryCardProps) {
  const status = getRecoveryStatus(hrv, baseline);

  return (
    <Card className="relative overflow-hidden">
      {/* Background gradient based on status */}
      <div
        className={`absolute inset-0 opacity-5 ${
          status.status === "green"
            ? "bg-gradient-to-br from-green-500"
            : status.status === "yellow"
            ? "bg-gradient-to-br from-yellow-500"
            : "bg-gradient-to-br from-red-500"
        }`}
      />

      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Today&apos;s Recovery
          </span>
          <TrafficLight status={status.status} size="lg" />
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Recovery Score */}
        <div className="text-center">
          <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            {recoveryScore}%
          </div>
          <p
            className={`text-sm font-medium ${
              status.status === "green"
                ? "text-green-600 dark:text-green-400"
                : status.status === "yellow"
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {status.label}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">HRV</span>
              {hrv >= baseline ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
            </div>
            <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {hrv} <span className="text-xs font-normal text-zinc-500">ms</span>
            </div>
            <div className="text-xs text-zinc-500">
              Baseline: {baseline} ms
            </div>
          </div>

          <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">RHR</span>
              {rhr <= 56 ? (
                <TrendingDown className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-500" />
              )}
            </div>
            <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {rhr} <span className="text-xs font-normal text-zinc-500">bpm</span>
            </div>
            <div className="text-xs text-zinc-500">
              Baseline: 56 bpm
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {status.recommendation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

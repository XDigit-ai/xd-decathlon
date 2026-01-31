"use client";

import { Card, CardContent, CardHeader, CardTitle, TrafficLight } from "@/components/ui";
import { getRecoveryStatus } from "@/lib/utils";
import { Activity } from "lucide-react";

interface RecoveryEntry {
  date: string;
  recoveryScore: number;
  hrv: number;
  rhr: number;
  baseline: number;
}

interface RecoveryHistoryProps {
  entries: RecoveryEntry[];
}

export function RecoveryHistory({ entries }: RecoveryHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          Recovery History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry, i) => {
            const status = getRecoveryStatus(entry.hrv, entry.baseline);
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
              >
                <div className="flex items-center gap-4">
                  <TrafficLight status={status.status} size="md" />
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {entry.date}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      HRV: {entry.hrv} ms | RHR: {entry.rhr} bpm
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {entry.recoveryScore}%
                  </p>
                  <p className={`text-sm ${
                    status.status === "green"
                      ? "text-green-600"
                      : status.status === "yellow"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}>
                    {status.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

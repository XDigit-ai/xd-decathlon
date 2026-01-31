"use client";

import { AppLayout } from "@/components/layout";
import { HRVChart, RecoveryHistory, SleepChart } from "@/components/recovery";
import { Card, CardContent, TrafficLight } from "@/components/ui";
import { getRecoveryStatus } from "@/lib/utils";
import { Bed, Heart, Activity, Thermometer } from "lucide-react";

// Demo data
const demoHRVData = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  const baseHrv = 65 + Math.sin(i / 2) * 8;
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    hrv: Math.round(baseHrv + (Math.random() - 0.5) * 10),
    avg7d: i >= 6 ? Math.round(baseHrv) : null,
    avg30d: i >= 13 ? 64 : null,
  };
});

const demoSleepData = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  return {
    date: date.toLocaleDateString("en-US", { weekday: "short" }),
    deep: 60 + Math.random() * 30,
    rem: 90 + Math.random() * 30,
    light: 180 + Math.random() * 60,
    awake: 15 + Math.random() * 15,
    total: 420 + Math.random() * 60,
  };
});

const demoRecoveryHistory = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  const hrv = 55 + Math.random() * 20;
  return {
    date: date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
    recoveryScore: Math.round(40 + hrv),
    hrv: Math.round(hrv),
    rhr: Math.round(52 + Math.random() * 8),
    baseline: 65,
  };
});

const todayRecovery = {
  hrv: 62,
  rhr: 54,
  recoveryScore: 78,
  baseline: 65,
  sleepScore: 82,
  strain: 12.4,
  skinTemp: 0.3,
};

export default function RecoveryPage() {
  const status = getRecoveryStatus(todayRecovery.hrv, todayRecovery.baseline);

  return (
    <AppLayout title="Recovery" subtitle="Whoop data and recovery metrics">
      <div className="space-y-6">
        {/* Today's Status */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Today&apos;s Recovery</p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    {todayRecovery.recoveryScore}%
                  </p>
                </div>
                <TrafficLight status={status.status} size="lg" />
              </div>
              <p className={`mt-2 text-sm ${
                status.status === "green"
                  ? "text-green-600"
                  : status.status === "yellow"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}>
                {status.recommendation}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">HRV</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {todayRecovery.hrv} ms
                  </p>
                  <p className="text-xs text-zinc-400">Baseline: {todayRecovery.baseline} ms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                  <Bed className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Sleep Score</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {todayRecovery.sleepScore}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                  <Activity className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Strain</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {todayRecovery.strain}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <HRVChart data={demoHRVData} baseline={todayRecovery.baseline} />
          <SleepChart data={demoSleepData} />
        </div>

        {/* Recovery History */}
        <RecoveryHistory entries={demoRecoveryHistory} />
      </div>
    </AppLayout>
  );
}

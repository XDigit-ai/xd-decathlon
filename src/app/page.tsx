"use client";

import { AppLayout } from "@/components/layout";
import {
  DomainStatusGrid,
  ProgressTargetsCard,
  QuickAdd,
  RecentWorkoutsCard,
  RecoveryCard,
  ReviewReminder,
  WeeklySnapshotCard,
} from "@/components/dashboard";
import type { DomainStatus, ProgressTarget, RecentWorkout, WeeklySnapshot } from "@/types";

// Demo data - in production, this would come from Supabase
const demoRecovery = {
  hrv: 62,
  baseline: 65,
  rhr: 54,
  recoveryScore: 78,
};

const demoWeeklySnapshot: WeeklySnapshot = {
  sessionsCompleted: 4,
  sessionsPlanned: 6,
  weightTrend: -0.3,
  avgHrv: 64,
  avgSleep: 420, // 7 hours in minutes
};

const demoTargets: ProgressTarget[] = [
  {
    id: "1",
    domain: "body",
    metricName: "Body Fat %",
    current: 23,
    target: 18,
    baseline: 24,
    unit: "%",
    percentage: 17,
    isLowerBetter: true,
  },
  {
    id: "2",
    domain: "strength",
    metricName: "Squat 1RM",
    current: 115,
    target: 150,
    baseline: 100,
    unit: "kg",
    percentage: 30,
    isLowerBetter: false,
  },
  {
    id: "3",
    domain: "cardio",
    metricName: "VO2 Max",
    current: 43,
    target: 50,
    baseline: 42,
    unit: "mL/kg/min",
    percentage: 12,
    isLowerBetter: false,
  },
  {
    id: "4",
    domain: "functional",
    metricName: "Dead Hang",
    current: 65,
    target: 120,
    baseline: 45,
    unit: "sec",
    percentage: 27,
    isLowerBetter: false,
  },
];

const demoWorkouts: RecentWorkout[] = [
  {
    id: "1",
    title: "Upper Body Push",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    volume: 8540,
    sets: 18,
    hasPR: true,
  },
  {
    id: "2",
    title: "Lower Body",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    volume: 12350,
    sets: 20,
    hasPR: false,
  },
  {
    id: "3",
    title: "Upper Body Pull",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    volume: 7820,
    sets: 17,
    hasPR: false,
  },
];

const demoDomains: DomainStatus[] = [
  {
    domain: "body",
    label: "Body",
    mainMetric: { label: "Weight (7d avg)", value: "83.2", unit: "kg" },
    trend: [84.5, 84.2, 84.0, 83.8, 83.5, 83.4, 83.2],
    status: "on-track",
  },
  {
    domain: "strength",
    label: "Strength",
    mainMetric: { label: "Total Volume", value: "28.7k", unit: "kg" },
    trend: [24000, 25500, 26200, 27100, 28000, 28500, 28700],
    status: "ahead",
  },
  {
    domain: "cardio",
    label: "Cardio",
    mainMetric: { label: "VO2 Max", value: "43", unit: "mL/kg/min" },
    trend: [41, 41.5, 42, 42.5, 42.8, 43, 43],
    status: "on-track",
  },
  {
    domain: "recovery",
    label: "Recovery",
    mainMetric: { label: "Avg HRV", value: "64", unit: "ms" },
    trend: [62, 58, 65, 68, 63, 66, 64],
    status: "on-track",
  },
  {
    domain: "functional",
    label: "Functional",
    mainMetric: { label: "Benchmarks", value: "42", unit: "%" },
    trend: [35, 36, 38, 39, 40, 41, 42],
    status: "behind",
  },
];

export default function DashboardPage() {
  const handleAddWeight = (weight: number, date: string) => {
    console.log("Adding weight:", weight, date);
    // TODO: Save to Supabase
  };

  const handleAddWellness = (data: { energy: number; stress: number; motivation: number; soreness: number }) => {
    console.log("Adding wellness:", data);
    // TODO: Save to Supabase
  };

  const handleAddVo2Max = (value: number, source: string) => {
    console.log("Adding VO2 Max:", value, source);
    // TODO: Save to Supabase
  };

  return (
    <AppLayout title="Dashboard" subtitle="Your fitness at a glance">
      <div className="space-y-6">
        {/* Review Reminder */}
        <ReviewReminder />

        {/* Top Section: Recovery + Quick Add */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecoveryCard
              hrv={demoRecovery.hrv}
              baseline={demoRecovery.baseline}
              rhr={demoRecovery.rhr}
              recoveryScore={demoRecovery.recoveryScore}
            />
          </div>
          <div>
            <QuickAdd
              onAddWeight={handleAddWeight}
              onAddWellness={handleAddWellness}
              onAddVo2Max={handleAddVo2Max}
            />
          </div>
        </div>

        {/* Weekly Snapshot */}
        <WeeklySnapshotCard snapshot={demoWeeklySnapshot} />

        {/* Domain Status Cards */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Domain Overview
          </h2>
          <DomainStatusGrid domains={demoDomains} />
        </div>

        {/* Progress + Recent Workouts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ProgressTargetsCard targets={demoTargets} />
          <RecentWorkoutsCard workouts={demoWorkouts} />
        </div>
      </div>
    </AppLayout>
  );
}

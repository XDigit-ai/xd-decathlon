"use client";

import { AppLayout } from "@/components/layout";
import { LiftChart, PRList, VolumeChart, WorkoutList } from "@/components/strength";
import { Card, CardContent, Tabs, TabContent, TabList, TabTrigger } from "@/components/ui";
import { Dumbbell, TrendingUp } from "lucide-react";

// Demo data for key lifts
const keyLifts = [
  {
    name: "Squat",
    target: 150,
    color: "#3b82f6",
    data: [
      { date: "Oct", e1rm: 100 },
      { date: "Nov", e1rm: 108 },
      { date: "Dec", e1rm: 112 },
      { date: "Jan", e1rm: 118 },
    ],
  },
  {
    name: "Bench Press",
    target: 110,
    color: "#ef4444",
    data: [
      { date: "Oct", e1rm: 80 },
      { date: "Nov", e1rm: 84 },
      { date: "Dec", e1rm: 88 },
      { date: "Jan", e1rm: 92 },
    ],
  },
  {
    name: "Deadlift",
    target: 180,
    color: "#22c55e",
    data: [
      { date: "Oct", e1rm: 120 },
      { date: "Nov", e1rm: 130 },
      { date: "Dec", e1rm: 138 },
      { date: "Jan", e1rm: 145 },
    ],
  },
  {
    name: "OHP",
    target: 72,
    color: "#f97316",
    data: [
      { date: "Oct", e1rm: 50 },
      { date: "Nov", e1rm: 53 },
      { date: "Dec", e1rm: 55 },
      { date: "Jan", e1rm: 58 },
    ],
  },
  {
    name: "Barbell Row",
    target: 100,
    color: "#a855f7",
    data: [
      { date: "Oct", e1rm: 70 },
      { date: "Nov", e1rm: 74 },
      { date: "Dec", e1rm: 78 },
      { date: "Jan", e1rm: 82 },
    ],
  },
];

const volumeData = [
  { muscleGroup: "Chest", sets: 12, color: "#ef4444" },
  { muscleGroup: "Back", sets: 14, color: "#3b82f6" },
  { muscleGroup: "Shoulders", sets: 10, color: "#f97316" },
  { muscleGroup: "Biceps", sets: 8, color: "#22c55e" },
  { muscleGroup: "Triceps", sets: 8, color: "#a855f7" },
  { muscleGroup: "Quads", sets: 12, color: "#06b6d4" },
  { muscleGroup: "Hamstrings", sets: 10, color: "#eab308" },
  { muscleGroup: "Glutes", sets: 8, color: "#ec4899" },
];

const demoWorkouts = [
  {
    id: "1",
    title: "Upper Body Push",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 65,
    volume: 8540,
    exercises: [
      { name: "Bench Press", sets: 4, bestSet: "85kg x 6", hasPR: true },
      { name: "Overhead Press", sets: 4, bestSet: "52.5kg x 8", hasPR: false },
      { name: "Incline DB Press", sets: 3, bestSet: "32.5kg x 10", hasPR: false },
      { name: "Lateral Raises", sets: 3, bestSet: "12kg x 15", hasPR: false },
      { name: "Tricep Pushdowns", sets: 3, bestSet: "35kg x 12", hasPR: false },
    ],
  },
  {
    id: "2",
    title: "Lower Body",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 72,
    volume: 12350,
    exercises: [
      { name: "Barbell Squat", sets: 4, bestSet: "110kg x 6", hasPR: false },
      { name: "Romanian Deadlift", sets: 4, bestSet: "90kg x 8", hasPR: false },
      { name: "Leg Press", sets: 3, bestSet: "180kg x 10", hasPR: true },
      { name: "Walking Lunges", sets: 3, bestSet: "24kg x 12", hasPR: false },
      { name: "Calf Raises", sets: 4, bestSet: "100kg x 15", hasPR: false },
    ],
  },
  {
    id: "3",
    title: "Upper Body Pull",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 68,
    volume: 7820,
    exercises: [
      { name: "Deadlift", sets: 4, bestSet: "140kg x 5", hasPR: true },
      { name: "Barbell Row", sets: 4, bestSet: "80kg x 8", hasPR: false },
      { name: "Pull-Ups", sets: 3, bestSet: "BW x 8", hasPR: false },
      { name: "Face Pulls", sets: 3, bestSet: "25kg x 15", hasPR: false },
      { name: "Barbell Curls", sets: 3, bestSet: "35kg x 10", hasPR: false },
    ],
  },
];

const demoPRs = [
  {
    id: "1",
    exerciseName: "Deadlift",
    value: 145,
    unit: "kg",
    recordType: "1rm" as const,
    achievedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    exerciseName: "Bench Press",
    value: 92,
    unit: "kg",
    recordType: "1rm" as const,
    achievedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    exerciseName: "Leg Press",
    value: 180,
    unit: "kg",
    recordType: "1rm" as const,
    achievedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const stats = {
  weeklyVolume: 28710,
  totalSets: 52,
  prsThisMonth: 5,
  avgRPE: 7.8,
};

export default function StrengthPage() {
  return (
    <AppLayout title="Strength" subtitle="Track your lifts and PRs">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <Dumbbell className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Weekly Volume</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {stats.weeklyVolume.toLocaleString()} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Sets</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {stats.totalSets}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30">
                  <TrendingUp className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">PRs This Month</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {stats.prsThisMonth}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                  <Dumbbell className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Avg RPE</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {stats.avgRPE}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="lifts">
          <TabList>
            <TabTrigger value="lifts">Key Lifts</TabTrigger>
            <TabTrigger value="volume">Volume</TabTrigger>
            <TabTrigger value="workouts">Workouts</TabTrigger>
            <TabTrigger value="prs">PRs</TabTrigger>
          </TabList>

          <TabContent value="lifts">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {keyLifts.map((lift) => (
                <LiftChart
                  key={lift.name}
                  liftName={lift.name}
                  data={lift.data}
                  target1RM={lift.target}
                  color={lift.color}
                />
              ))}
            </div>
          </TabContent>

          <TabContent value="volume">
            <VolumeChart data={volumeData} />
          </TabContent>

          <TabContent value="workouts">
            <WorkoutList workouts={demoWorkouts} />
          </TabContent>

          <TabContent value="prs">
            <PRList records={demoPRs} />
          </TabContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

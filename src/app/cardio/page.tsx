"use client";

import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabContent, TabList, TabTrigger, Input, Button, Select, Badge } from "@/components/ui";
import { calculateHRZones } from "@/types";
import { Activity, Heart, Timer, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Legend,
  ReferenceLine,
} from "recharts";

// Demo data
const vo2MaxData = [
  { date: "Oct", whoop: 41, appleWatch: 39.1, cooperTest: null },
  { date: "Nov", whoop: 42, appleWatch: 40.2, cooperTest: null },
  { date: "Dec", whoop: 43, appleWatch: 41.0, cooperTest: 42 },
  { date: "Jan", whoop: 45, appleWatch: 42.5, cooperTest: null },
];

const zone2Sessions = [
  { date: "Jan 28", duration: 48, avgHr: 134, timeInZone: 85 },
  { date: "Jan 25", duration: 52, avgHr: 138, timeInZone: 78 },
  { date: "Jan 21", duration: 45, avgHr: 132, timeInZone: 92 },
  { date: "Jan 18", duration: 55, avgHr: 136, timeInZone: 82 },
];

const hiitSessions = [
  {
    date: "Jan 30",
    intervals: [
      { interval: 1, avgHr: 162, compliance: 95 },
      { interval: 2, avgHr: 165, compliance: 100 },
      { interval: 3, avgHr: 158, compliance: 85 },
      { interval: 4, avgHr: 160, compliance: 90 },
    ],
    overallCompliance: 92,
  },
  {
    date: "Jan 23",
    intervals: [
      { interval: 1, avgHr: 155, compliance: 80 },
      { interval: 2, avgHr: 161, compliance: 92 },
      { interval: 3, avgHr: 163, compliance: 98 },
      { interval: 4, avgHr: 159, compliance: 88 },
    ],
    overallCompliance: 89,
  },
];

const stats = {
  currentVo2: 43,
  targetVo2: 50,
  weeklyZone2: 97,
  targetZone2: 120,
  hiitCompliance: 92,
};

export default function CardioPage() {
  const [vo2Value, setVo2Value] = useState("");
  const [vo2Source, setVo2Source] = useState("manual");

  const hrZones = calculateHRZones(56, 178);

  const handleAddVo2 = () => {
    console.log("Adding VO2 Max:", vo2Value, vo2Source);
    setVo2Value("");
  };

  return (
    <AppLayout title="Cardiovascular" subtitle="VO2 Max and cardio training">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                  <Zap className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">VO2 Max</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {stats.currentVo2} <span className="text-sm font-normal">mL/kg/min</span>
                  </p>
                  <p className="text-xs text-zinc-400">Target: {stats.targetVo2}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                  <Timer className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Zone 2 This Week</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {stats.weeklyZone2} <span className="text-sm font-normal">min</span>
                  </p>
                  <p className="text-xs text-zinc-400">Target: {stats.targetZone2} min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                  <Activity className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">HIIT Compliance</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {stats.hiitCompliance}%
                  </p>
                  <p className="text-xs text-zinc-400">Last session</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Progress</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {Math.round(((stats.currentVo2 - 42) / (stats.targetVo2 - 42)) * 100)}%
                  </p>
                  <p className="text-xs text-zinc-400">to target</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="vo2">
          <TabList>
            <TabTrigger value="vo2">VO2 Max</TabTrigger>
            <TabTrigger value="zone2">Zone 2</TabTrigger>
            <TabTrigger value="hiit">HIIT</TabTrigger>
            <TabTrigger value="zones">HR Zones</TabTrigger>
          </TabList>

          <TabContent value="vo2">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>VO2 Max Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={vo2MaxData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                        <YAxis domain={[35, 55]} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }}
                        />
                        <Legend />
                        <ReferenceLine y={50} stroke="#22c55e" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="whoop" stroke="#3b82f6" strokeWidth={2} name="Whoop" />
                        <Line type="monotone" dataKey="appleWatch" stroke="#a855f7" strokeWidth={2} name="Apple Watch" />
                        <Line type="monotone" dataKey="cooperTest" stroke="#22c55e" strokeWidth={2} name="Cooper Test" connectNulls={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Log VO2 Max</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="VO2 Max (mL/kg/min)"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 45.2"
                    value={vo2Value}
                    onChange={(e) => setVo2Value(e.target.value)}
                  />
                  <Select
                    label="Source"
                    value={vo2Source}
                    onChange={(e) => setVo2Source(e.target.value)}
                    options={[
                      { value: "manual", label: "Manual Entry" },
                      { value: "apple_watch", label: "Apple Watch" },
                      { value: "whoop", label: "Whoop" },
                      { value: "cooper_test", label: "Cooper Test" },
                    ]}
                  />
                  <Button onClick={handleAddVo2} className="w-full">
                    Save
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabContent>

          <TabContent value="zone2">
            <Card>
              <CardHeader>
                <CardTitle>Zone 2 Sessions (129-141 bpm)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {zone2Sessions.map((session, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
                    >
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{session.date}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {session.duration} min · Avg HR: {session.avgHr} bpm
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          {session.timeInZone}%
                        </p>
                        <Badge variant={session.timeInZone >= 80 ? "success" : "warning"} size="sm">
                          Time in Zone
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabContent>

          <TabContent value="hiit">
            <Card>
              <CardHeader>
                <CardTitle>Norwegian 4x4 Sessions (151-169 bpm)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hiitSessions.map((session, i) => (
                    <div key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{session.date}</p>
                        <Badge variant={session.overallCompliance >= 90 ? "success" : "warning"}>
                          {session.overallCompliance}% Compliance
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {session.intervals.map((interval) => (
                          <div
                            key={interval.interval}
                            className={`rounded-lg p-2 text-center ${
                              interval.compliance >= 90
                                ? "bg-green-100 dark:bg-green-900/30"
                                : interval.compliance >= 80
                                ? "bg-yellow-100 dark:bg-yellow-900/30"
                                : "bg-red-100 dark:bg-red-900/30"
                            }`}
                          >
                            <p className="text-xs text-zinc-500">Interval {interval.interval}</p>
                            <p className="text-sm font-medium">{interval.avgHr} bpm</p>
                            <p className="text-xs">{interval.compliance}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabContent>

          <TabContent value="zones">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Heart Rate Zones (RHR: 56, Max: 178)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hrZones.map((zone) => (
                    <div
                      key={zone.zone}
                      className="flex items-center gap-4 rounded-lg p-3"
                      style={{ backgroundColor: `${zone.color}20` }}
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold"
                        style={{ backgroundColor: zone.color }}
                      >
                        {zone.zone}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{zone.name}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {zone.minPercent}% - {zone.maxPercent}% HRR
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          {zone.minHR} - {zone.maxHR}
                        </p>
                        <p className="text-sm text-zinc-500">bpm</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

"use client";

import { AppLayout } from "@/components/layout";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Modal, Select } from "@/components/ui";
import { formatDate, formatTime } from "@/lib/utils";
import { FUNCTIONAL_BENCHMARKS } from "@/types";
import { CheckCircle, Plus, Target, Trophy, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

// Demo current values
const currentValues: Record<string, { value: number; side?: "left" | "right"; lastTested: string; isPR: boolean }> = {
  dead_hang: { value: 65, lastTested: "2026-01-15", isPR: false },
  farmer_walk: { value: 85, lastTested: "2026-01-15", isPR: false },
  plank: { value: 72, lastTested: "2026-01-10", isPR: true },
  wall_sit: { value: 95, lastTested: "2026-01-10", isPR: false },
  pull_ups: { value: 7, lastTested: "2026-01-20", isPR: true },
  balance_eyes_open_left: { value: 45, side: "left", lastTested: "2026-01-05", isPR: false },
  balance_eyes_open_right: { value: 52, side: "right", lastTested: "2026-01-05", isPR: false },
  balance_eyes_closed_left: { value: 8, side: "left", lastTested: "2026-01-05", isPR: false },
  balance_eyes_closed_right: { value: 10, side: "right", lastTested: "2026-01-05", isPR: true },
  floor_getup: { value: 0, lastTested: "2026-01-05", isPR: false },
  deadlift_reps: { value: 8, lastTested: "2026-01-12", isPR: false },
  grip_strength_left: { value: 42, side: "left", lastTested: "2025-12-15", isPR: false },
  grip_strength_right: { value: 45, side: "right", lastTested: "2025-12-15", isPR: false },
  one_mile_run: { value: 8.25, lastTested: "2026-01-08", isPR: false },
  vo2_max: { value: 43, lastTested: "2026-01-25", isPR: false },
};

// Calculate radar chart data
const radarData = FUNCTIONAL_BENCHMARKS.filter(b => !b.hasSides).map(benchmark => {
  const current = currentValues[benchmark.testType];
  const percentage = current ? Math.min(100, (current.value / benchmark.target) * 100) : 0;
  return {
    test: benchmark.displayName.replace("Single-Leg ", "").slice(0, 12),
    current: percentage,
    target: 100,
  };
});

export default function FunctionalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(FUNCTIONAL_BENCHMARKS[0].testType);
  const [testValue, setTestValue] = useState("");
  const [testSide, setTestSide] = useState<"left" | "right" | "both">("both");

  // Calculate overall progress
  const totalTests = Object.keys(currentValues).length;
  const passedTests = Object.entries(currentValues).filter(([key, val]) => {
    const benchmark = FUNCTIONAL_BENCHMARKS.find(b =>
      b.testType === key ||
      key.startsWith(b.testType)
    );
    if (!benchmark) return false;
    return val.value >= benchmark.target;
  }).length;

  const overallProgress = Math.round((passedTests / totalTests) * 100);

  const handleSubmitTest = () => {
    console.log("Submitting test:", { selectedTest, testValue, testSide });
    setIsModalOpen(false);
    setTestValue("");
  };

  return (
    <AppLayout title="Functional Fitness" subtitle="Peter Attia's Centenarian Decathlon">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Overall Progress</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {overallProgress}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Tests Passed</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {passedTests}/{totalTests}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Recent PRs</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {Object.values(currentValues).filter(v => v.isPR).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <Button onClick={() => setIsModalOpen(true)} className="w-full h-full">
                <Plus className="mr-2 h-4 w-4" />
                Log Test
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-500" />
              Benchmark Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="test" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Target"
                    dataKey="target"
                    stroke="#3b82f6"
                    fill="transparent"
                    strokeDasharray="5 5"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Benchmark Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Benchmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="pb-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">Test</th>
                    <th className="pb-3 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">Current</th>
                    <th className="pb-3 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">Target</th>
                    <th className="pb-3 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">Progress</th>
                    <th className="pb-3 text-right text-sm font-medium text-zinc-500 dark:text-zinc-400">Last Tested</th>
                  </tr>
                </thead>
                <tbody>
                  {FUNCTIONAL_BENCHMARKS.map((benchmark) => {
                    const key = benchmark.hasSides
                      ? `${benchmark.testType}_left`
                      : benchmark.testType;
                    const current = currentValues[key];
                    const currentRight = benchmark.hasSides
                      ? currentValues[`${benchmark.testType}_right`]
                      : null;

                    const displayValue = benchmark.hasSides
                      ? `L: ${current?.value || 0} / R: ${currentRight?.value || 0}`
                      : benchmark.testType === "floor_getup"
                      ? current?.value === 0 ? "Pass" : `${current?.value} arm(s)`
                      : benchmark.testType === "one_mile_run"
                      ? formatTime(Math.round((current?.value || 0) * 60))
                      : `${current?.value || 0}`;

                    const progress = benchmark.hasSides
                      ? Math.min(100, ((Math.min(current?.value || 0, currentRight?.value || 0)) / benchmark.target) * 100)
                      : benchmark.testType === "floor_getup"
                      ? current?.value === 0 ? 100 : 0
                      : benchmark.testType === "one_mile_run"
                      ? Math.min(100, (benchmark.target / (current?.value || 999)) * 100)
                      : Math.min(100, ((current?.value || 0) / benchmark.target) * 100);

                    const isPassed = progress >= 100;
                    const isPR = current?.isPR || currentRight?.isPR;

                    return (
                      <tr key={benchmark.testType} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                              {benchmark.displayName}
                            </span>
                            {isPR && (
                              <Badge variant="success" size="sm">
                                <Trophy className="mr-1 h-3 w-3" />
                                PR
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {displayValue}
                          </span>
                          <span className="ml-1 text-sm text-zinc-500">{benchmark.unit}</span>
                        </td>
                        <td className="py-3 text-center text-zinc-500 dark:text-zinc-400">
                          {benchmark.testType === "floor_getup"
                            ? `≤${benchmark.target}`
                            : benchmark.testType === "one_mile_run"
                            ? formatTime(benchmark.target * 60)
                            : benchmark.target} {benchmark.unit}
                        </td>
                        <td className="py-3">
                          <div className="mx-auto w-24">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
                                <div
                                  className={`h-2 rounded-full ${isPassed ? "bg-green-500" : "bg-blue-500"}`}
                                  style={{ width: `${Math.min(100, progress)}%` }}
                                />
                              </div>
                              {isPassed && <CheckCircle className="h-4 w-4 text-green-500" />}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-right text-sm text-zinc-500 dark:text-zinc-400">
                          {current?.lastTested ? formatDate(current.lastTested) : "Never"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log Test Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Functional Test" size="md">
        <div className="space-y-4">
          <Select
            label="Test"
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            options={FUNCTIONAL_BENCHMARKS.map(b => ({
              value: b.testType,
              label: b.displayName,
            }))}
          />

          {FUNCTIONAL_BENCHMARKS.find(b => b.testType === selectedTest)?.hasSides && (
            <Select
              label="Side"
              value={testSide}
              onChange={(e) => setTestSide(e.target.value as "left" | "right" | "both")}
              options={[
                { value: "left", label: "Left" },
                { value: "right", label: "Right" },
                { value: "both", label: "Both" },
              ]}
            />
          )}

          <Input
            label={`Value (${FUNCTIONAL_BENCHMARKS.find(b => b.testType === selectedTest)?.unit || ""})`}
            type="number"
            step="0.1"
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
          />

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmitTest}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

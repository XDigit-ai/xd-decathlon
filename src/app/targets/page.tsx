"use client";

import { AppLayout } from "@/components/layout";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Modal, ProgressBar, Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Activity, Dumbbell, Heart, Plus, Scale, Target, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";

interface TargetData {
  id: string;
  domain: "body" | "strength" | "cardio" | "recovery" | "functional";
  metricName: string;
  baseline: number;
  current: number;
  target3m: number | null;
  target6m: number | null;
  target12m: number | null;
  unit: string;
  isLowerBetter: boolean;
  startDate: string;
}

// Demo targets
const demoTargets: TargetData[] = [
  { id: "1", domain: "body", metricName: "Body Fat %", baseline: 24, current: 22, target3m: 22, target6m: 20, target12m: 18, unit: "%", isLowerBetter: true, startDate: "2025-10-01" },
  { id: "2", domain: "body", metricName: "Weight", baseline: 85, current: 83.2, target3m: 83, target6m: 81, target12m: 80, unit: "kg", isLowerBetter: true, startDate: "2025-10-01" },
  { id: "3", domain: "strength", metricName: "Squat 1RM", baseline: 100, current: 118, target3m: 115, target6m: 130, target12m: 150, unit: "kg", isLowerBetter: false, startDate: "2025-10-01" },
  { id: "4", domain: "strength", metricName: "Bench Press 1RM", baseline: 80, current: 92, target3m: 90, target6m: 100, target12m: 110, unit: "kg", isLowerBetter: false, startDate: "2025-10-01" },
  { id: "5", domain: "strength", metricName: "Deadlift 1RM", baseline: 120, current: 145, target3m: 140, target6m: 160, target12m: 180, unit: "kg", isLowerBetter: false, startDate: "2025-10-01" },
  { id: "6", domain: "cardio", metricName: "VO2 Max", baseline: 42, current: 43, target3m: 45, target6m: 47, target12m: 50, unit: "mL/kg/min", isLowerBetter: false, startDate: "2025-10-01" },
  { id: "7", domain: "recovery", metricName: "HRV Baseline", baseline: 65, current: 64, target3m: 70, target6m: 75, target12m: 80, unit: "ms", isLowerBetter: false, startDate: "2025-10-01" },
  { id: "8", domain: "functional", metricName: "Dead Hang", baseline: 45, current: 65, target3m: 70, target6m: 95, target12m: 120, unit: "sec", isLowerBetter: false, startDate: "2025-10-01" },
  { id: "9", domain: "functional", metricName: "Pull-Ups", baseline: 5, current: 7, target3m: 7, target6m: 8, target12m: 10, unit: "reps", isLowerBetter: false, startDate: "2025-10-01" },
];

const domainIcons = {
  body: Scale,
  strength: Dumbbell,
  cardio: Activity,
  recovery: Heart,
  functional: Zap,
};

const domainColors = {
  body: "text-purple-500",
  strength: "text-blue-500",
  cardio: "text-orange-500",
  recovery: "text-red-500",
  functional: "text-green-500",
};

function calculateProgress(target: TargetData): { percentage: number; status: "ahead" | "on-track" | "behind" } {
  const totalChange = target.isLowerBetter
    ? target.baseline - (target.target12m || target.target6m || target.target3m || target.baseline)
    : (target.target12m || target.target6m || target.target3m || target.baseline) - target.baseline;

  const actualChange = target.isLowerBetter
    ? target.baseline - target.current
    : target.current - target.baseline;

  if (totalChange === 0) return { percentage: 100, status: "on-track" };

  const percentage = Math.min(100, Math.max(0, (actualChange / totalChange) * 100));

  // Determine status based on time elapsed and expected progress
  const startDate = new Date(target.startDate);
  const now = new Date();
  const totalDays = 365; // 12-month target
  const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const expectedProgress = (daysElapsed / totalDays) * 100;

  if (percentage >= expectedProgress + 10) return { percentage, status: "ahead" };
  if (percentage >= expectedProgress - 10) return { percentage, status: "on-track" };
  return { percentage, status: "behind" };
}

export default function TargetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>("all");

  const filteredTargets = selectedDomain === "all"
    ? demoTargets
    : demoTargets.filter(t => t.domain === selectedDomain);

  const domainStats = {
    body: demoTargets.filter(t => t.domain === "body"),
    strength: demoTargets.filter(t => t.domain === "strength"),
    cardio: demoTargets.filter(t => t.domain === "cardio"),
    recovery: demoTargets.filter(t => t.domain === "recovery"),
    functional: demoTargets.filter(t => t.domain === "functional"),
  };

  return (
    <AppLayout title="Targets & Goals" subtitle="SMART goals and progress tracking">
      <div className="space-y-6">
        {/* Domain Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedDomain === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setSelectedDomain("all")}
          >
            All
          </Button>
          {(["body", "strength", "cardio", "recovery", "functional"] as const).map((domain) => {
            const Icon = domainIcons[domain];
            return (
              <Button
                key={domain}
                variant={selectedDomain === domain ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedDomain(domain)}
              >
                <Icon className="mr-1 h-4 w-4" />
                {domain.charAt(0).toUpperCase() + domain.slice(1)}
                <Badge variant="default" size="sm" className="ml-2">
                  {domainStats[domain].length}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Targets Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTargets.map((target) => {
            const { percentage, status } = calculateProgress(target);
            const Icon = domainIcons[target.domain];

            return (
              <Card key={target.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Icon className={cn("h-5 w-5", domainColors[target.domain])} />
                      {target.metricName}
                    </span>
                    <Badge
                      variant={
                        status === "ahead" ? "success" : status === "on-track" ? "info" : "warning"
                      }
                      size="sm"
                    >
                      {status === "ahead" ? "Ahead" : status === "on-track" ? "On Track" : "Behind"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current vs Target */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Current</p>
                      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {target.current}
                        <span className="ml-1 text-sm font-normal text-zinc-500">{target.unit}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">12-Month Target</p>
                      <p className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">
                        {target.target12m || target.target6m || target.target3m} {target.unit}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <ProgressBar
                    value={percentage}
                    color={
                      status === "ahead" ? "green" : status === "on-track" ? "blue" : "yellow"
                    }
                    size="lg"
                  />

                  {/* Milestones */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <p className="text-zinc-400">Baseline</p>
                      <p className="font-medium text-zinc-600 dark:text-zinc-400">{target.baseline}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400">3 Month</p>
                      <p className={cn(
                        "font-medium",
                        target.target3m && (target.isLowerBetter
                          ? target.current <= target.target3m
                          : target.current >= target.target3m)
                          ? "text-green-600"
                          : "text-zinc-600 dark:text-zinc-400"
                      )}>
                        {target.target3m || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-400">6 Month</p>
                      <p className="font-medium text-zinc-600 dark:text-zinc-400">{target.target6m || "-"}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400">12 Month</p>
                      <p className="font-medium text-zinc-600 dark:text-zinc-400">{target.target12m || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Target Button */}
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Target
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add Target Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Target" size="lg">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Domain"
              options={[
                { value: "body", label: "Body Composition" },
                { value: "strength", label: "Strength" },
                { value: "cardio", label: "Cardiovascular" },
                { value: "recovery", label: "Recovery" },
                { value: "functional", label: "Functional Fitness" },
              ]}
            />
            <Input label="Metric Name" placeholder="e.g., Squat 1RM" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Baseline Value" type="number" />
            <Input label="Unit" placeholder="e.g., kg, %, reps" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="3-Month Target" type="number" />
            <Input label="6-Month Target" type="number" />
            <Input label="12-Month Target" type="number" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => setIsModalOpen(false)}>
              Save Target
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

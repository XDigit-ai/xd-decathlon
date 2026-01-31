"use client";

import { type ReactElement, useState } from "react";
import { BenchmarkCard } from "./benchmark-card";
import { TestForm } from "./test-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FunctionalTest {
  id: string;
  user_id: string;
  date: string;
  test_type: string;
  value: number;
  unit: string;
  load_kg: number | null;
  notes: string | null;
  is_pr: boolean;
  created_at: string;
}

interface BenchmarkGroup {
  latest: FunctionalTest | null;
  best: FunctionalTest | null;
  all: FunctionalTest[];
}

interface BenchmarkGridProps {
  groupedData: Record<string, BenchmarkGroup>;
}

const BENCHMARK_CONFIG: Record<string, {
  name: string;
  target: number;
  unit: string;
  isInverted?: boolean;
  isPassFail?: boolean;
}> = {
  dead_hang: { name: "Dead Hang", target: 120, unit: "seconds" },
  farmer_walk: { name: "Farmer's Walk", target: 120, unit: "seconds" },
  plank: { name: "Plank", target: 60, unit: "seconds" },
  wall_sit: { name: "Wall Sit", target: 120, unit: "seconds" },
  pull_ups: { name: "Pull-Ups", target: 10, unit: "reps" },
  balance_open_l: { name: "Single-Leg Balance (Eyes Open)", target: 60, unit: "seconds" },
  balance_open_r: { name: "Single-Leg Balance (Eyes Open)", target: 60, unit: "seconds" },
  balance_closed_l: { name: "Single-Leg Balance (Eyes Closed)", target: 12, unit: "seconds" },
  balance_closed_r: { name: "Single-Leg Balance (Eyes Closed)", target: 12, unit: "seconds" },
  floor_getup: { name: "Floor Get-Up", target: 0, unit: "arms", isPassFail: true },
  deadlift_reps: { name: "Deadlift (Bodyweight)", target: 10, unit: "reps" },
  grip_l: { name: "Grip Strength", target: 55, unit: "kg" },
  grip_r: { name: "Grip Strength", target: 55, unit: "kg" },
  mile_run: { name: "1-Mile Run", target: 450, unit: "seconds", isInverted: true },
};

export function BenchmarkGrid({ groupedData }: BenchmarkGridProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Combine L/R variants into pairs for display
  const renderBenchmarks = () => {
    const cards: ReactElement[] = [];
    const processed = new Set<string>();

    Object.entries(BENCHMARK_CONFIG).forEach(([testType, config]) => {
      if (processed.has(testType)) return;

      const group = groupedData[testType];

      // Check if this is a L/R pair
      if (testType.endsWith('_l')) {
        const baseType = testType.slice(0, -2);
        const rightType = `${baseType}_r`;
        const rightGroup = groupedData[rightType];
        const rightConfig = BENCHMARK_CONFIG[rightType];

        if (rightConfig) {
          // Render both L and R in a 2-column mini-grid
          cards.push(
            <div key={testType} className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <BenchmarkCard
                name={config.name}
                target={config.target}
                unit={config.unit}
                current={group?.latest?.value ?? null}
                best={group?.best?.value ?? null}
                lastTested={group?.latest?.date ?? null}
                isPR={group?.latest?.is_pr ?? false}
                isInverted={config.isInverted}
                isPassFail={config.isPassFail}
                variant="left"
              />
              <BenchmarkCard
                name={rightConfig.name}
                target={rightConfig.target}
                unit={rightConfig.unit}
                current={rightGroup?.latest?.value ?? null}
                best={rightGroup?.best?.value ?? null}
                lastTested={rightGroup?.latest?.date ?? null}
                isPR={rightGroup?.latest?.is_pr ?? false}
                isInverted={rightConfig.isInverted}
                isPassFail={rightConfig.isPassFail}
                variant="right"
              />
            </div>
          );
          processed.add(testType);
          processed.add(rightType);
        }
      } else if (!testType.endsWith('_r')) {
        // Regular single benchmark
        cards.push(
          <BenchmarkCard
            key={testType}
            name={config.name}
            target={config.target}
            unit={config.unit}
            current={group?.latest?.value ?? null}
            best={group?.best?.value ?? null}
            lastTested={group?.latest?.date ?? null}
            isPR={group?.latest?.is_pr ?? false}
            isInverted={config.isInverted}
            isPassFail={config.isPassFail}
          />
        );
        processed.add(testType);
      }
    });

    return cards;
  };

  return (
    <div className="space-y-6">
      {/* Header with action button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Centenarian Decathlon</h2>
          <p className="text-sm text-muted-foreground">
            Track your progress on Peter Attia's longevity benchmarks
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Test Result</DialogTitle>
              <DialogDescription>
                Log your performance on a functional fitness benchmark
              </DialogDescription>
            </DialogHeader>
            <TestForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Benchmark Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderBenchmarks()}
      </div>
    </div>
  );
}

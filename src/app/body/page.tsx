"use client";

import { AppLayout } from "@/components/layout";
import {
  BodyFatChart,
  DexaForm,
  MeasurementsForm,
  WeightChart,
  WeightEntryForm,
} from "@/components/body";
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabContent, TabList, TabTrigger } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { Scale, TrendingDown } from "lucide-react";
import type { MeasurementData } from "@/components/body/measurements-form";
import type { DexaData } from "@/components/body/dexa-form";

// Demo data
const demoWeightData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const baseWeight = 85 - (i * 0.05);
  const weight = Math.random() > 0.1 ? baseWeight + (Math.random() - 0.5) * 0.5 : null;

  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weight,
    avg7d: i >= 6 ? 85 - (i * 0.05) : null,
    avg30d: i >= 29 ? 83.5 : null,
  };
});

const demoBodyFatData = [
  { date: "Oct 1", bodyFat: 24.0, isDexa: true },
  { date: "Oct 15", bodyFat: 23.5, isDexa: false },
  { date: "Nov 1", bodyFat: 23.2, isDexa: false },
  { date: "Nov 15", bodyFat: 22.8, isDexa: false },
  { date: "Dec 1", bodyFat: 22.5, isDexa: true },
  { date: "Dec 15", bodyFat: 22.2, isDexa: false },
  { date: "Jan 1", bodyFat: 22.0, isDexa: false },
  { date: "Jan 15", bodyFat: 21.8, isDexa: false },
];

const demoStats = {
  currentWeight: 83.2,
  weightChange7d: -0.4,
  weightChange30d: -1.8,
  currentBodyFat: 22.0,
  targetWeight: 80,
  targetBodyFat: 18,
};

export default function BodyPage() {
  const handleWeightSubmit = (weight: number, date: string, notes?: string) => {
    console.log("Weight submitted:", { weight, date, notes });
    // TODO: Save to Supabase
  };

  const handleMeasurementsSubmit = (measurements: MeasurementData) => {
    console.log("Measurements submitted:", measurements);
    // TODO: Save to Supabase
  };

  const handleDexaSubmit = (data: DexaData) => {
    console.log("DEXA submitted:", data);
    // TODO: Save to Supabase
  };

  return (
    <AppLayout title="Body Composition" subtitle="Weight, measurements, and DEXA tracking">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                  <Scale className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Current Weight</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {demoStats.currentWeight} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                  <TrendingDown className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">7-Day Change</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {demoStats.weightChange7d} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <TrendingDown className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">30-Day Change</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {demoStats.weightChange30d} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                  <Scale className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Body Fat %</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {demoStats.currentBodyFat}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <WeightChart data={demoWeightData} targetWeight={demoStats.targetWeight} />
        <BodyFatChart data={demoBodyFatData} targetBodyFat={demoStats.targetBodyFat} />

        {/* Data Entry Tabs */}
        <Tabs defaultValue="weight">
          <TabList>
            <TabTrigger value="weight">Log Weight</TabTrigger>
            <TabTrigger value="measurements">Measurements</TabTrigger>
            <TabTrigger value="dexa">DEXA Scan</TabTrigger>
          </TabList>

          <TabContent value="weight">
            <div className="grid gap-6 lg:grid-cols-2">
              <WeightEntryForm
                onSubmit={handleWeightSubmit}
                latestWeight={demoStats.currentWeight}
              />

              {/* Recent entries */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {demoWeightData
                      .filter((d) => d.weight !== null)
                      .slice(-7)
                      .reverse()
                      .map((entry, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                        >
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {entry.date}
                          </span>
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {entry.weight?.toFixed(1)} kg
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabContent>

          <TabContent value="measurements">
            <MeasurementsForm onSubmit={handleMeasurementsSubmit} />
          </TabContent>

          <TabContent value="dexa">
            <DexaForm onSubmit={handleDexaSubmit} />
          </TabContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

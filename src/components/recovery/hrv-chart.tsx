"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Heart } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface HRVDataPoint {
  date: string;
  hrv: number;
  avg7d: number | null;
  avg30d: number | null;
}

interface HRVChartProps {
  data: HRVDataPoint[];
  baseline: number;
}

export function HRVChart({ data, baseline }: HRVChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          HRV Trend (RMSSD)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                tickLine={{ stroke: "#374151" }}
              />
              <YAxis
                domain={["dataMin - 10", "dataMax + 10"]}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                tickLine={{ stroke: "#374151" }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fafafa" }}
              />
              <ReferenceLine
                y={baseline}
                stroke="#22c55e"
                strokeDasharray="5 5"
                label={{ value: `Baseline: ${baseline}`, fill: "#22c55e", fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="hrv"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", r: 3 }}
                name="hrv"
              />
              <Line
                type="monotone"
                dataKey="avg7d"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="avg7d"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="avg30d"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                name="avg30d"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-4 rounded bg-red-500" />
            <span className="text-zinc-500 dark:text-zinc-400">Daily HRV</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-4 rounded bg-blue-500" />
            <span className="text-zinc-500 dark:text-zinc-400">7-Day Avg</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 border-t-2 border-dashed border-orange-500" />
            <span className="text-zinc-500 dark:text-zinc-400">30-Day Avg</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 border-t-2 border-dashed border-green-500" />
            <span className="text-zinc-500 dark:text-zinc-400">Baseline</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

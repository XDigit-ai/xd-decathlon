"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Scale } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface WeightDataPoint {
  date: string;
  weight: number | null;
  avg7d: number | null;
  avg30d: number | null;
}

interface WeightChartProps {
  data: WeightDataPoint[];
  targetWeight: number;
}

export function WeightChart({ data, targetWeight }: WeightChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-purple-500" />
          Weight Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                tickLine={{ stroke: "#374151" }}
              />
              <YAxis
                domain={["dataMin - 2", "dataMax + 2"]}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                tickLine={{ stroke: "#374151" }}
                tickFormatter={(value) => `${value} kg`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fafafa" }}
              />
              <Legend />
              <ReferenceLine
                y={targetWeight}
                stroke="#22c55e"
                strokeDasharray="5 5"
                label={{ value: "Target", fill: "#22c55e", fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#a855f7"
                strokeWidth={2}
                dot={{ fill: "#a855f7", r: 3 }}
                name="Daily Weight"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="avg7d"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="7-Day Avg"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="avg30d"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                name="30-Day Avg"
                strokeDasharray="5 5"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

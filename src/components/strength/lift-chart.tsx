"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Dumbbell } from "lucide-react";
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

interface LiftDataPoint {
  date: string;
  e1rm: number;
}

interface LiftChartProps {
  liftName: string;
  data: LiftDataPoint[];
  target1RM: number;
  color?: string;
}

export function LiftChart({ liftName, data, target1RM, color = "#3b82f6" }: LiftChartProps) {
  const current1RM = data.length > 0 ? data[data.length - 1].e1rm : 0;
  const progress = target1RM > 0 ? ((current1RM / target1RM) * 100).toFixed(0) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" style={{ color }} />
            {liftName}
          </CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {current1RM} kg
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {progress}% of {target1RM} kg target
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickLine={{ stroke: "#374151" }}
              />
              <YAxis
                domain={["dataMin - 5", "dataMax + 5"]}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickLine={{ stroke: "#374151" }}
                width={40}
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
                y={target1RM}
                stroke="#22c55e"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="e1rm"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

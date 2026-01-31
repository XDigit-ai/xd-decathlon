"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Moon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SleepDataPoint {
  date: string;
  deep: number;
  rem: number;
  light: number;
  awake: number;
  total: number;
}

interface SleepChartProps {
  data: SleepDataPoint[];
}

export function SleepChart({ data }: SleepChartProps) {
  // Convert minutes to hours for display
  const chartData = data.map((d) => ({
    date: d.date,
    Deep: +(d.deep / 60).toFixed(1),
    REM: +(d.rem / 60).toFixed(1),
    Light: +(d.light / 60).toFixed(1),
    Awake: +(d.awake / 60).toFixed(1),
    total: +(d.total / 60).toFixed(1),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-purple-500" />
          Sleep Stages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                tickLine={{ stroke: "#374151" }}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                tickLine={{ stroke: "#374151" }}
                tickFormatter={(value) => `${value}h`}
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
              <Bar dataKey="Deep" stackId="a" fill="#1e3a8a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="REM" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Light" stackId="a" fill="#93c5fd" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Awake" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

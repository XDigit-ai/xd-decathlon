"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Percent } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";

interface BodyFatDataPoint {
  date: string;
  bodyFat: number | null;
  isDexa: boolean;
}

interface BodyFatChartProps {
  data: BodyFatDataPoint[];
  targetBodyFat: number;
}

export function BodyFatChart({ data, targetBodyFat }: BodyFatChartProps) {
  const dexaPoints = data.filter(d => d.isDexa && d.bodyFat !== null);
  const estimatePoints = data.filter(d => !d.isDexa && d.bodyFat !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-green-500" />
          Body Fat Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                tickFormatter={(value) => `${value}%`}
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
                y={targetBodyFat}
                stroke="#22c55e"
                strokeDasharray="5 5"
                label={{ value: "Target", fill: "#22c55e", fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="bodyFat"
                stroke="#22c55e"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.isDexa) {
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="#22c55e"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return <circle cx={cx} cy={cy} r={3} fill="#22c55e" />;
                }}
                name="Body Fat %"
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
            <span>DEXA Scan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Estimate</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

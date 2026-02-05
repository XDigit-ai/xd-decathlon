'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Legend,
} from 'recharts';
import { chartColors, chartHex, axisProps, tooltipStyle, CHART_HEIGHT } from './chart-config';

export interface RecoveryTrendDataPoint {
  date: string;
  recovery: number;
  hrv: number | null;
  rhr: number | null;
}

interface RecoveryTrendChartProps {
  data: RecoveryTrendDataPoint[];
}

export function RecoveryTrendChart({ data }: RecoveryTrendChartProps) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <LineChart data={data} margin={{ top: 5, right: 50, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />

        {/* Recovery zone bands */}
        <ReferenceArea yAxisId="recovery" y1={66} y2={100} fill={chartHex.green} fillOpacity={0.08} />
        <ReferenceArea yAxisId="recovery" y1={34} y2={66} fill={chartHex.yellow} fillOpacity={0.08} />
        <ReferenceArea yAxisId="recovery" y1={0} y2={34} fill={chartHex.red} fillOpacity={0.08} />

        <XAxis dataKey="date" {...axisProps} />
        <YAxis
          yAxisId="recovery"
          domain={[0, 100]}
          {...axisProps}
          tickFormatter={(v: number) => `${v}%`}
        />
        <YAxis
          yAxisId="secondary"
          orientation="right"
          {...axisProps}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(value: number, name: string) => {
            if (name === 'recovery') return [`${value}%`, 'Recovery'];
            if (name === 'hrv') return [`${value} ms`, 'HRV'];
            if (name === 'rhr') return [`${value} bpm`, 'RHR'];
            return [value, name];
          }}
        />
        <Legend />

        <Line
          yAxisId="recovery"
          type="monotone"
          dataKey="recovery"
          name="recovery"
          stroke={chartColors.blue}
          strokeWidth={2}
          dot={{ r: 3, fill: chartColors.blue }}
          activeDot={{ r: 5 }}
        />
        <Line
          yAxisId="secondary"
          type="monotone"
          dataKey="hrv"
          name="hrv"
          stroke={chartColors.purple}
          strokeWidth={2}
          dot={{ r: 2, fill: chartColors.purple }}
          connectNulls
        />
        <Line
          yAxisId="secondary"
          type="monotone"
          dataKey="rhr"
          name="rhr"
          stroke={chartColors.cyan}
          strokeWidth={2}
          dot={{ r: 2, fill: chartColors.cyan }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

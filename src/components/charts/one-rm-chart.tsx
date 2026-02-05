'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { chartColors, axisProps, tooltipStyle, CHART_HEIGHT } from './chart-config';

export interface OneRmDataPoint {
  date: string;
  oneRm: number;
  isPR: boolean;
  sourceWeight: number | null;
  sourceReps: number | null;
}

interface OneRmChartProps {
  data: OneRmDataPoint[];
  exerciseTitle: string;
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: OneRmDataPoint;
}

function PRDot({ cx, cy, payload }: CustomDotProps) {
  if (!cx || !cy || !payload) return null;

  if (payload.isPR) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="var(--chart-orange)"
        stroke="var(--card)"
        strokeWidth={2}
      />
    );
  }

  return (
    <circle cx={cx} cy={cy} r={3} fill="var(--chart-blue)" />
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: OneRmDataPoint;
    value: number;
  }>;
  label?: string;
}

function OneRmTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null;

  const point = payload[0].payload;

  return (
    <div
      style={{
        ...tooltipStyle.contentStyle,
        padding: '8px 12px',
      }}
    >
      <p style={tooltipStyle.labelStyle}>{label}</p>
      <p style={{ color: 'var(--foreground)', margin: 0 }}>
        <span style={{ fontWeight: 600 }}>{point.oneRm.toFixed(1)} kg</span>
        {point.isPR && (
          <span style={{ color: 'var(--chart-orange)', marginLeft: 6, fontSize: 12 }}>
            PR!
          </span>
        )}
      </p>
      {point.sourceWeight && point.sourceReps && (
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, margin: '2px 0 0' }}>
          from {point.sourceWeight}kg × {point.sourceReps} reps
        </p>
      )}
    </div>
  );
}

export function OneRmChart({ data, exerciseTitle }: OneRmChartProps) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.oneRm);
  const minVal = Math.floor(Math.min(...values) * 0.95);
  const maxVal = Math.ceil(Math.max(...values) * 1.05);

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" {...axisProps} />
        <YAxis
          domain={[minVal, maxVal]}
          {...axisProps}
          tickFormatter={(v: number) => `${v}kg`}
        />
        <Tooltip content={<OneRmTooltip />} />
        <Line
          type="monotone"
          dataKey="oneRm"
          stroke={chartColors.blue}
          strokeWidth={2}
          dot={<PRDot />}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

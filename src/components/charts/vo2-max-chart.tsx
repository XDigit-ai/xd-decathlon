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
} from 'recharts';
import { chartColors, chartHex, axisProps, tooltipStyle, CHART_HEIGHT } from './chart-config';

export interface Vo2MaxDataPoint {
  date: string;
  value: number;
  source: string;
}

interface Vo2MaxChartProps {
  data: Vo2MaxDataPoint[];
}

/** VO2 max fitness category bands */
const FITNESS_BANDS = [
  { y1: 52, y2: 60, fill: chartHex.green, label: 'Superior' },
  { y1: 45, y2: 52, fill: chartHex.green, label: 'Excellent' },
  { y1: 40, y2: 45, fill: chartHex.blue, label: 'Good' },
  { y1: 36, y2: 40, fill: chartHex.yellow, label: 'Average' },
  { y1: 32, y2: 36, fill: chartHex.orange, label: 'Below Avg' },
  { y1: 20, y2: 32, fill: chartHex.red, label: 'Poor' },
] as const;

export function Vo2MaxChart({ data }: Vo2MaxChartProps) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);

  // Dynamic domain: show at least 2 bands around data range
  const domainMin = Math.max(20, Math.floor(dataMin - 6));
  const domainMax = Math.min(60, Math.ceil(dataMax + 6));

  // Only render bands that overlap with the visible domain
  const visibleBands = FITNESS_BANDS.filter(
    (band) => band.y2 > domainMin && band.y1 < domainMax
  );

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />

        {visibleBands.map((band) => (
          <ReferenceArea
            key={band.label}
            y1={Math.max(band.y1, domainMin)}
            y2={Math.min(band.y2, domainMax)}
            fill={band.fill}
            fillOpacity={0.08}
            label={{
              value: band.label,
              position: 'insideRight',
              fontSize: 10,
              fill: 'var(--muted-foreground)',
            }}
          />
        ))}

        <XAxis dataKey="date" {...axisProps} />
        <YAxis
          domain={[domainMin, domainMax]}
          {...axisProps}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(value: number) => [`${value} ml/kg/min`, 'VO2 Max']}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={chartColors.blue}
          strokeWidth={2}
          dot={{ r: 4, fill: chartColors.blue }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

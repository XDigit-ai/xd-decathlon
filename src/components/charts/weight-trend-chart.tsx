'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { chartColors, axisProps, tooltipStyle, CHART_HEIGHT } from './chart-config';

export interface WeightTrendDataPoint {
  date: string;
  weight: number;
  bodyFat: number | null;
  avg7d: number | null;
}

interface WeightTrendChartProps {
  data: WeightTrendDataPoint[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

export function WeightTrendChart({ data, trend }: WeightTrendChartProps) {
  if (data.length === 0) return null;

  const hasBodyFat = data.some((d) => d.bodyFat !== null);

  // Compute Y-axis domain with padding
  const weights = data.map((d) => d.weight);
  const minWeight = Math.floor(Math.min(...weights) - 1);
  const maxWeight = Math.ceil(Math.max(...weights) + 1);

  const TrendIcon = trend === 'increasing' ? TrendingUp : trend === 'decreasing' ? TrendingDown : Minus;
  const trendColor = trend === 'increasing' ? 'text-red-500' : trend === 'decreasing' ? 'text-green-500' : 'text-muted-foreground';
  const trendLabel = trend === 'increasing' ? 'Trending up' : trend === 'decreasing' ? 'Trending down' : 'Stable';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={trendColor}>
          <TrendIcon className="h-3 w-3 mr-1" />
          {trendLabel}
        </Badge>
      </div>

      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart data={data} margin={{ top: 5, right: hasBodyFat ? 50 : 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" {...axisProps} />
          <YAxis
            yAxisId="weight"
            domain={[minWeight, maxWeight]}
            {...axisProps}
            tickFormatter={(v: number) => `${v}kg`}
          />
          {hasBodyFat && (
            <YAxis
              yAxisId="bf"
              orientation="right"
              {...axisProps}
              tickFormatter={(v: number) => `${v}%`}
            />
          )}
          <Tooltip
            {...tooltipStyle}
            formatter={(value: number, name: string) => {
              if (name === 'weight') return [`${value.toFixed(1)} kg`, 'Weight'];
              if (name === 'avg7d') return [`${value.toFixed(1)} kg`, '7-day avg'];
              if (name === 'bodyFat') return [`${value.toFixed(1)}%`, 'Body fat'];
              return [value, name];
            }}
          />
          <Legend />

          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="weight"
            name="weight"
            stroke={chartColors.blue}
            strokeWidth={2}
            dot={{ r: 3, fill: chartColors.blue }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="avg7d"
            name="avg7d"
            stroke={chartColors.muted}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            connectNulls
          />
          {hasBodyFat && (
            <Line
              yAxisId="bf"
              type="monotone"
              dataKey="bodyFat"
              name="bodyFat"
              stroke={chartColors.orange}
              strokeWidth={2}
              dot={{ r: 3, fill: chartColors.orange }}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

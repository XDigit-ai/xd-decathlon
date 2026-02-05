/**
 * Shared Recharts configuration for consistent chart styling across the app.
 *
 * Uses CSS variables for line strokes (auto-adapts to dark mode) and
 * hardcoded hex values for ReferenceArea fills (CSS vars don't reliably
 * work in SVG fill+opacity contexts).
 */

/** CSS variable references for line strokes — auto-adapt to dark mode */
export const chartColors = {
  blue: 'var(--chart-blue)',
  purple: 'var(--chart-purple)',
  cyan: 'var(--chart-cyan)',
  orange: 'var(--chart-orange)',
  pink: 'var(--chart-pink)',
  muted: 'var(--muted-foreground)',
} as const;

/** Hardcoded hex values for ReferenceArea fills where CSS vars fail */
export const chartHex = {
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  blue: '#3b82f6',
  orange: '#f97316',
  cyan: '#06b6d4',
} as const;

/** Shared XAxis/YAxis styling props */
export const axisProps = {
  tick: { fontSize: 12, fill: 'var(--muted-foreground)' },
  tickLine: false,
  axisLine: false,
} as const;

/** Consistent tooltip appearance */
export const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    fontSize: '13px',
  },
  labelStyle: {
    color: 'var(--foreground)',
    fontWeight: 600,
    marginBottom: '4px',
  },
} as const;

/** Standard chart height in pixels */
export const CHART_HEIGHT = 300;

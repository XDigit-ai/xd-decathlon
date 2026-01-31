/**
 * Rolling average calculation utilities for time-series data analysis.
 *
 * These functions help smooth out day-to-day fluctuations and identify trends
 * in metrics like weight, HRV, and resting heart rate.
 */

export interface DataPoint {
  date: Date | string;
  value: number;
}

export interface RollingAverageResult {
  date: Date;
  value: number;
  average: number;
  dataPoints: number;
}

/**
 * Calculates a simple N-day rolling average from time series data.
 *
 * This function:
 * - Handles missing days by skipping them (no interpolation)
 * - Requires minimum data points to return a valid average
 * - Sorts data by date before calculating
 * - Returns null for periods with insufficient data
 *
 * @param {DataPoint[]} data - Array of data points with date and value
 * @param {number} windowSize - Number of days to include in the rolling window
 * @param {number} minDataPoints - Minimum number of data points required for valid average
 * @returns {RollingAverageResult[]} Array of rolling averages
 *
 * @example
 * ```ts
 * const data = [
 *   { date: '2024-01-01', value: 180 },
 *   { date: '2024-01-02', value: 182 },
 *   { date: '2024-01-03', value: 179 },
 *   { date: '2024-01-05', value: 181 }, // Missing day 4
 *   { date: '2024-01-06', value: 180 },
 * ];
 * const averages = calculateRollingAverage(data, 7, 3);
 * ```
 */
export function calculateRollingAverage(
  data: DataPoint[],
  windowSize: number,
  minDataPoints: number = 3
): RollingAverageResult[] {
  if (!data || data.length === 0 || windowSize <= 0) {
    return [];
  }

  // Sort data by date
  const sortedData = [...data]
    .map((point) => ({
      date: typeof point.date === 'string' ? new Date(point.date) : point.date,
      value: point.value,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const results: RollingAverageResult[] = [];

  // Calculate rolling average for each point
  for (let i = 0; i < sortedData.length; i++) {
    const currentDate = sortedData[i].date;
    const windowStart = new Date(currentDate);
    windowStart.setDate(windowStart.getDate() - windowSize + 1);

    // Get all points within the window
    const windowPoints = sortedData.filter((point) => {
      return point.date >= windowStart && point.date <= currentDate;
    });

    // Only calculate average if we have enough data points
    if (windowPoints.length >= minDataPoints) {
      const sum = windowPoints.reduce((acc, point) => acc + point.value, 0);
      const average = sum / windowPoints.length;

      results.push({
        date: currentDate,
        value: sortedData[i].value,
        average: Math.round(average * 100) / 100,
        dataPoints: windowPoints.length,
      });
    }
  }

  return results;
}

/**
 * Calculates a 7-day rolling average.
 *
 * Requires at least 3 data points within the 7-day window for a valid average.
 *
 * @param {DataPoint[]} data - Array of data points
 * @returns {RollingAverageResult[]} 7-day rolling averages
 *
 * @example
 * ```ts
 * const weeklyAverage = calculate7DayAverage(weightData);
 * ```
 */
export function calculate7DayAverage(data: DataPoint[]): RollingAverageResult[] {
  return calculateRollingAverage(data, 7, 3);
}

/**
 * Calculates a 30-day rolling average.
 *
 * Requires at least 7 data points within the 30-day window for a valid average.
 *
 * @param {DataPoint[]} data - Array of data points
 * @returns {RollingAverageResult[]} 30-day rolling averages
 *
 * @example
 * ```ts
 * const monthlyAverage = calculate30DayAverage(hrvData);
 * ```
 */
export function calculate30DayAverage(data: DataPoint[]): RollingAverageResult[] {
  return calculateRollingAverage(data, 30, 7);
}

/**
 * Gets the most recent rolling average value.
 *
 * @param {DataPoint[]} data - Array of data points
 * @param {number} windowSize - Size of the rolling window
 * @param {number} minDataPoints - Minimum required data points
 * @returns {number | null} Most recent average, or null if insufficient data
 *
 * @example
 * ```ts
 * const currentAverage = getCurrentAverage(hrvData, 30, 7);
 * if (currentAverage !== null) {
 *   console.log(`Current 30-day average: ${currentAverage}`);
 * }
 * ```
 */
export function getCurrentAverage(
  data: DataPoint[],
  windowSize: number,
  minDataPoints: number
): number | null {
  const averages = calculateRollingAverage(data, windowSize, minDataPoints);

  if (averages.length === 0) {
    return null;
  }

  return averages[averages.length - 1].average;
}

/**
 * Calculates the percentage change between current value and rolling average.
 *
 * @param {number} currentValue - Current metric value
 * @param {number} average - Rolling average value
 * @returns {number} Percentage relative to average (e.g., 105 means 5% above average)
 *
 * @example
 * ```ts
 * const percentage = getPercentageOfAverage(68, 65); // Returns 104.62
 * ```
 */
export function getPercentageOfAverage(currentValue: number, average: number): number {
  if (average <= 0) {
    return 0;
  }

  return Math.round((currentValue / average) * 100 * 100) / 100;
}

/**
 * Detects trend direction from rolling average data.
 *
 * @param {RollingAverageResult[]} averages - Array of rolling averages
 * @param {number} lookbackPeriod - Number of recent points to analyze
 * @returns {'increasing' | 'decreasing' | 'stable'} Trend direction
 *
 * @example
 * ```ts
 * const trend = detectTrend(averages, 7);
 * if (trend === 'increasing') {
 *   console.log('Metric is trending upward');
 * }
 * ```
 */
export function detectTrend(
  averages: RollingAverageResult[],
  lookbackPeriod: number = 7
): 'increasing' | 'decreasing' | 'stable' {
  if (!averages || averages.length < 2) {
    return 'stable';
  }

  const recentData = averages.slice(-lookbackPeriod);
  if (recentData.length < 2) {
    return 'stable';
  }

  const firstAverage = recentData[0].average;
  const lastAverage = recentData[recentData.length - 1].average;

  const percentageChange = ((lastAverage - firstAverage) / firstAverage) * 100;

  // Consider changes less than 2% as stable
  if (Math.abs(percentageChange) < 2) {
    return 'stable';
  }

  return percentageChange > 0 ? 'increasing' : 'decreasing';
}

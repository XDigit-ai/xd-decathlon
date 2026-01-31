/**
 * Recovery status assessment using HRV (Heart Rate Variability) data.
 *
 * Implements a traffic light system for training readiness:
 * - Green: Train as planned (HRV > 95% of baseline)
 * - Yellow: Reduce volume/intensity (HRV 90-95% of baseline)
 * - Red: Active recovery only (HRV < 90% of baseline)
 */

import { getCurrentAverage, type DataPoint } from './rolling-average';

export type RecoveryStatus = 'green' | 'yellow' | 'red';

export interface RecoveryStatusResult {
  status: RecoveryStatus;
  message: string;
  percentage: number;
  currentHRV: number;
  baselineHRV: number | null;
  recommendation: string;
}

/**
 * Assesses recovery status based on current HRV relative to 30-day baseline.
 *
 * The traffic light system provides clear guidance:
 * - Green (>95%): Fully recovered, proceed with planned training
 * - Yellow (90-95%): Partial recovery, reduce training load
 * - Red (<90%): Poor recovery, active recovery only
 *
 * @param {number} currentHRV - Today's HRV reading
 * @param {DataPoint[]} historicalData - 30+ days of HRV data for baseline
 * @returns {RecoveryStatusResult} Recovery status assessment
 *
 * @example
 * ```ts
 * const hrvData = [
 *   { date: '2024-01-01', value: 65 },
 *   { date: '2024-01-02', value: 68 },
 *   // ... more data
 * ];
 * const status = assessRecoveryStatus(72, hrvData);
 * console.log(status.status); // 'green'
 * console.log(status.message); // 'Fully recovered - train as planned'
 * ```
 */
export function assessRecoveryStatus(
  currentHRV: number,
  historicalData: DataPoint[]
): RecoveryStatusResult {
  // Calculate 30-day baseline
  const baselineHRV = getCurrentAverage(historicalData, 30, 7);

  // If no baseline available, return neutral status
  if (baselineHRV === null) {
    return {
      status: 'yellow',
      message: 'Insufficient baseline data',
      percentage: 0,
      currentHRV,
      baselineHRV: null,
      recommendation:
        'Continue collecting HRV data for at least 7 days to establish a baseline. Train at moderate intensity.',
    };
  }

  // Calculate percentage of baseline
  const percentage = Math.round((currentHRV / baselineHRV) * 100 * 10) / 10;

  // Determine status based on thresholds
  if (percentage > 95) {
    return {
      status: 'green',
      message: 'Fully recovered - train as planned',
      percentage,
      currentHRV,
      baselineHRV,
      recommendation:
        'Your body is well-recovered. Proceed with your planned training session at full intensity.',
    };
  } else if (percentage >= 90) {
    return {
      status: 'yellow',
      message: 'Moderate recovery - reduce volume or intensity',
      percentage,
      currentHRV,
      baselineHRV,
      recommendation:
        'Consider reducing training volume by 20-30% or lowering intensity. Focus on technique and listen to your body.',
    };
  } else {
    return {
      status: 'red',
      message: 'Poor recovery - active recovery only',
      percentage,
      currentHRV,
      baselineHRV,
      recommendation:
        'Prioritize recovery today. Engage in light activity (walking, stretching, yoga) and ensure adequate sleep and nutrition.',
    };
  }
}

/**
 * Calculates a recovery score (0-100) based on multiple metrics.
 *
 * This provides a more holistic view by combining:
 * - HRV (50% weight)
 * - Resting Heart Rate (30% weight)
 * - Subjective readiness (20% weight)
 *
 * @param {Object} metrics - Recovery metrics
 * @param {number} metrics.currentHRV - Current HRV
 * @param {DataPoint[]} metrics.hrvData - Historical HRV data
 * @param {number} metrics.currentRHR - Current resting heart rate
 * @param {DataPoint[]} metrics.rhrData - Historical RHR data
 * @param {number} metrics.readinessScore - Subjective readiness (1-10)
 * @returns {number} Recovery score (0-100)
 *
 * @example
 * ```ts
 * const score = calculateRecoveryScore({
 *   currentHRV: 68,
 *   hrvData: historicalHRV,
 *   currentRHR: 56,
 *   rhrData: historicalRHR,
 *   readinessScore: 8,
 * });
 * ```
 */
export function calculateRecoveryScore(metrics: {
  currentHRV: number;
  hrvData: DataPoint[];
  currentRHR: number;
  rhrData: DataPoint[];
  readinessScore: number;
}): number {
  const { currentHRV, hrvData, currentRHR, rhrData, readinessScore } = metrics;

  // HRV component (50% weight)
  const baselineHRV = getCurrentAverage(hrvData, 30, 7);
  let hrvScore = 50;
  if (baselineHRV !== null) {
    const hrvPercentage = (currentHRV / baselineHRV) * 100;
    hrvScore = Math.min(100, Math.max(0, hrvPercentage)) * 0.5;
  }

  // RHR component (30% weight) - lower is better
  const baselineRHR = getCurrentAverage(rhrData, 30, 7);
  let rhrScore = 30;
  if (baselineRHR !== null) {
    // Invert RHR score (lower RHR = better recovery)
    const rhrPercentage = 100 - ((currentRHR - baselineRHR) / baselineRHR) * 100;
    rhrScore = Math.min(100, Math.max(0, rhrPercentage)) * 0.3;
  }

  // Readiness component (20% weight)
  const readinessNormalized = Math.min(10, Math.max(1, readinessScore));
  const readinessScoreWeighted = (readinessNormalized / 10) * 100 * 0.2;

  const totalScore = hrvScore + rhrScore + readinessScoreWeighted;

  return Math.round(totalScore * 10) / 10;
}

/**
 * Determines if it's safe to perform high-intensity training.
 *
 * @param {RecoveryStatusResult} status - Current recovery status
 * @returns {boolean} True if high-intensity training is recommended
 *
 * @example
 * ```ts
 * const status = assessRecoveryStatus(72, hrvData);
 * const canGoHard = canTrainHighIntensity(status);
 * ```
 */
export function canTrainHighIntensity(status: RecoveryStatusResult): boolean {
  return status.status === 'green';
}

/**
 * Suggests training intensity based on recovery status.
 *
 * @param {RecoveryStatus} status - Recovery status (green/yellow/red)
 * @returns {{ maxIntensity: number; description: string }} Intensity recommendation
 *
 * @example
 * ```ts
 * const intensity = getRecommendedIntensity('yellow');
 * console.log(intensity.maxIntensity); // 75
 * console.log(intensity.description); // 'Moderate intensity'
 * ```
 */
export function getRecommendedIntensity(status: RecoveryStatus): {
  maxIntensity: number;
  description: string;
} {
  switch (status) {
    case 'green':
      return {
        maxIntensity: 100,
        description: 'Full intensity - all training zones available',
      };
    case 'yellow':
      return {
        maxIntensity: 75,
        description: 'Moderate intensity - avoid max effort sets',
      };
    case 'red':
      return {
        maxIntensity: 50,
        description: 'Low intensity - active recovery only',
      };
    default:
      return {
        maxIntensity: 75,
        description: 'Moderate intensity',
      };
  }
}

/**
 * Tracks recovery trends over time.
 *
 * @param {DataPoint[]} hrvData - Historical HRV data
 * @param {number} days - Number of days to analyze
 * @returns {{ trend: 'improving' | 'declining' | 'stable'; avgStatus: RecoveryStatus }} Recovery trend
 *
 * @example
 * ```ts
 * const trend = analyzeRecoveryTrend(hrvData, 14);
 * if (trend.trend === 'declining') {
 *   console.log('Consider reducing training load');
 * }
 * ```
 */
export function analyzeRecoveryTrend(
  hrvData: DataPoint[],
  days: number = 7
): { trend: 'improving' | 'declining' | 'stable'; avgStatus: RecoveryStatus } {
  if (!hrvData || hrvData.length < days) {
    return { trend: 'stable', avgStatus: 'yellow' };
  }

  const recentData = hrvData.slice(-days);
  const firstHalf = recentData.slice(0, Math.floor(days / 2));
  const secondHalf = recentData.slice(Math.floor(days / 2));

  const firstAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;

  const percentageChange = ((secondAvg - firstAvg) / firstAvg) * 100;

  let trend: 'improving' | 'declining' | 'stable';
  if (percentageChange > 3) {
    trend = 'improving';
  } else if (percentageChange < -3) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  // Determine average status based on recent average
  const baselineHRV = getCurrentAverage(hrvData, 30, 7);
  let avgStatus: RecoveryStatus = 'yellow';
  if (baselineHRV !== null) {
    const percentage = (secondAvg / baselineHRV) * 100;
    if (percentage > 95) {
      avgStatus = 'green';
    } else if (percentage < 90) {
      avgStatus = 'red';
    }
  }

  return { trend, avgStatus };
}

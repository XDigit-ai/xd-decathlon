/**
 * Progress tracking and calculation utilities for fitness goals.
 *
 * Handles different goal types:
 * - Higher is better (weight lifted, reps, HRV)
 * - Lower is better (body fat %, mile time, resting heart rate)
 */

export interface ProgressGoal {
  id: string;
  metric: string;
  starting_value: number;
  target_value: number;
  current_value: number;
  start_date: Date | string;
  target_date: Date | string;
  lower_is_better?: boolean;
}

export interface ProgressResult {
  percentage: number;
  status: 'on-track' | 'behind' | 'ahead' | 'completed';
  message: string;
  remainingValue: number;
  elapsedDays: number;
  totalDays: number;
  expectedProgress: number;
  actualProgress: number;
}

/**
 * Calculates progress percentage toward a goal.
 *
 * Handles both increasing and decreasing metrics correctly.
 *
 * @param {number} startingValue - Initial value
 * @param {number} targetValue - Goal value
 * @param {number} currentValue - Current value
 * @param {boolean} lowerIsBetter - Whether lower values are better (e.g., body fat)
 * @returns {number} Progress percentage (0-100+)
 *
 * @example
 * ```ts
 * // Weight gain goal: 180 -> 200 lbs, currently 190
 * const progress1 = calculateProgressPercentage(180, 200, 190, false); // Returns 50
 *
 * // Body fat goal: 20% -> 15%, currently 18%
 * const progress2 = calculateProgressPercentage(20, 15, 18, true); // Returns 40
 * ```
 */
export function calculateProgressPercentage(
  startingValue: number,
  targetValue: number,
  currentValue: number,
  lowerIsBetter: boolean = false
): number {
  // Handle edge cases
  if (startingValue === targetValue) {
    return 100;
  }

  const totalChange = targetValue - startingValue;
  const currentChange = currentValue - startingValue;

  // Calculate percentage
  const percentage = (currentChange / totalChange) * 100;

  // Clamp to reasonable range (can exceed 100% if goal is surpassed)
  return Math.max(0, Math.round(percentage * 10) / 10);
}

/**
 * Analyzes progress toward a goal including time-based expectations.
 *
 * Determines if progress is on-track, ahead, or behind based on:
 * - Actual progress made
 * - Time elapsed vs total time
 * - Expected linear progress
 *
 * @param {ProgressGoal} goal - Goal data
 * @returns {ProgressResult} Detailed progress analysis
 *
 * @example
 * ```ts
 * const goal = {
 *   id: '1',
 *   metric: 'Body Weight',
 *   starting_value: 180,
 *   target_value: 200,
 *   current_value: 190,
 *   start_date: '2024-01-01',
 *   target_date: '2024-04-01',
 *   lower_is_better: false,
 * };
 * const analysis = analyzeProgress(goal);
 * console.log(analysis.status); // 'on-track', 'ahead', or 'behind'
 * ```
 */
export function analyzeProgress(goal: ProgressGoal): ProgressResult {
  const startDate = typeof goal.start_date === 'string' ? new Date(goal.start_date) : goal.start_date;
  const targetDate =
    typeof goal.target_date === 'string' ? new Date(goal.target_date) : goal.target_date;
  const today = new Date();

  // Calculate time metrics
  const totalDays = Math.max(
    1,
    Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const elapsedDays = Math.max(
    0,
    Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const timeProgress = Math.min(100, (elapsedDays / totalDays) * 100);

  // Calculate value metrics
  const actualProgress = calculateProgressPercentage(
    goal.starting_value,
    goal.target_value,
    goal.current_value,
    goal.lower_is_better
  );
  const expectedProgress = timeProgress;

  const remainingValue = Math.abs(goal.target_value - goal.current_value);

  // Determine status
  let status: 'on-track' | 'behind' | 'ahead' | 'completed';
  let message: string;

  if (actualProgress >= 100) {
    status = 'completed';
    message = 'Goal achieved! Consider setting a new target.';
  } else if (actualProgress >= expectedProgress + 10) {
    status = 'ahead';
    message = `Ahead of schedule by ${Math.round(actualProgress - expectedProgress)}%`;
  } else if (actualProgress < expectedProgress - 10) {
    status = 'behind';
    message = `Behind schedule by ${Math.round(expectedProgress - actualProgress)}%`;
  } else {
    status = 'on-track';
    message = 'On track to reach your goal';
  }

  return {
    percentage: actualProgress,
    status,
    message,
    remainingValue,
    elapsedDays,
    totalDays,
    expectedProgress: Math.round(expectedProgress * 10) / 10,
    actualProgress: Math.round(actualProgress * 10) / 10,
  };
}

/**
 * Calculates the required rate of change to reach goal on time.
 *
 * @param {ProgressGoal} goal - Goal data
 * @returns {{ valuePerDay: number; valuePerWeek: number; isAchievable: boolean }} Required rate
 *
 * @example
 * ```ts
 * const rate = calculateRequiredRate(goal);
 * console.log(`Need to gain ${rate.valuePerWeek} lbs per week`);
 * ```
 */
export function calculateRequiredRate(goal: ProgressGoal): {
  valuePerDay: number;
  valuePerWeek: number;
  isAchievable: boolean;
} {
  const targetDate =
    typeof goal.target_date === 'string' ? new Date(goal.target_date) : goal.target_date;
  const today = new Date();

  const remainingDays = Math.max(
    1,
    Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );
  const remainingValue = goal.target_value - goal.current_value;

  const valuePerDay = remainingValue / remainingDays;
  const valuePerWeek = valuePerDay * 7;

  // Determine if achievable based on metric type
  let isAchievable = true;

  // Weight loss/gain: >3 lbs/week is aggressive
  if (goal.metric.toLowerCase().includes('weight') && Math.abs(valuePerWeek) > 3) {
    isAchievable = false;
  }

  // Body fat: >1% per week is aggressive
  if (goal.metric.toLowerCase().includes('fat') && Math.abs(valuePerWeek) > 1) {
    isAchievable = false;
  }

  return {
    valuePerDay: Math.round(valuePerDay * 100) / 100,
    valuePerWeek: Math.round(valuePerWeek * 100) / 100,
    isAchievable,
  };
}

/**
 * Projects when the goal will be achieved based on current rate.
 *
 * @param {ProgressGoal} goal - Goal data
 * @param {number[]} recentValues - Recent measurements for trend analysis
 * @returns {{ projectedDate: Date | null; daysToGoal: number | null; onSchedule: boolean }} Projection
 *
 * @example
 * ```ts
 * const recentWeights = [185, 186, 187, 188, 190];
 * const projection = projectGoalCompletion(goal, recentWeights);
 * ```
 */
export function projectGoalCompletion(
  goal: ProgressGoal,
  recentValues: number[]
): { projectedDate: Date | null; daysToGoal: number | null; onSchedule: boolean } {
  if (!recentValues || recentValues.length < 2) {
    return { projectedDate: null, daysToGoal: null, onSchedule: false };
  }

  // Calculate average rate of change from recent data
  const changes: number[] = [];
  for (let i = 1; i < recentValues.length; i++) {
    changes.push(recentValues[i] - recentValues[i - 1]);
  }

  const avgChangePerMeasurement = changes.reduce((sum, c) => sum + c, 0) / changes.length;

  if (avgChangePerMeasurement === 0) {
    return { projectedDate: null, daysToGoal: null, onSchedule: false };
  }

  // Calculate remaining change needed
  const remainingChange = goal.target_value - goal.current_value;

  // Project measurements needed
  const measurementsNeeded = remainingChange / avgChangePerMeasurement;

  // Assume measurements are daily (adjust based on your tracking frequency)
  const daysToGoal = Math.ceil(Math.abs(measurementsNeeded));

  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + daysToGoal);

  const targetDate =
    typeof goal.target_date === 'string' ? new Date(goal.target_date) : goal.target_date;
  const onSchedule = projectedDate <= targetDate;

  return {
    projectedDate,
    daysToGoal,
    onSchedule,
  };
}

/**
 * Generates milestone checkpoints for a goal.
 *
 * @param {ProgressGoal} goal - Goal data
 * @param {number} numberOfMilestones - Number of checkpoints to create
 * @returns {Array<{ value: number; percentage: number; label: string }>} Milestones
 *
 * @example
 * ```ts
 * const milestones = generateMilestones(goal, 4);
 * // Returns: 25%, 50%, 75%, 100% checkpoints
 * ```
 */
export function generateMilestones(
  goal: ProgressGoal,
  numberOfMilestones: number = 4
): Array<{ value: number; percentage: number; label: string }> {
  const milestones: Array<{ value: number; percentage: number; label: string }> = [];
  const totalChange = goal.target_value - goal.starting_value;

  for (let i = 1; i <= numberOfMilestones; i++) {
    const percentage = (i / numberOfMilestones) * 100;
    const value = goal.starting_value + (totalChange * i) / numberOfMilestones;

    milestones.push({
      value: Math.round(value * 100) / 100,
      percentage,
      label: `${percentage}% Complete`,
    });
  }

  return milestones;
}

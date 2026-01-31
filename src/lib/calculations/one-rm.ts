/**
 * One-Rep Max (1RM) calculation utilities using the Epley formula.
 *
 * The Epley formula is: 1RM = weight × (1 + reps / 30)
 * This formula is most accurate for sets with 1-12 reps.
 */

export interface SetData {
  weight: number;
  reps: number;
  is_warmup?: boolean;
  is_failure?: boolean;
}

/**
 * Calculates the estimated one-rep max (1RM) using the Epley formula.
 *
 * The Epley formula is considered accurate for rep ranges between 1-12 reps.
 * For higher rep ranges, the formula becomes less reliable and may overestimate.
 *
 * @param {number} weight - The weight lifted in the set
 * @param {number} reps - The number of reps performed
 * @returns {number} Estimated 1RM, or 0 if inputs are invalid
 *
 * @example
 * ```ts
 * const oneRM = calculateOneRM(100, 5); // Returns ~116.67
 * ```
 */
export function calculateOneRM(weight: number, reps: number): number {
  // Validate inputs
  if (weight <= 0 || reps <= 0 || !Number.isFinite(weight) || !Number.isFinite(reps)) {
    return 0;
  }

  // For 1 rep, the 1RM is the weight itself
  if (reps === 1) {
    return weight;
  }

  // Epley formula: 1RM = weight × (1 + reps / 30)
  const oneRM = weight * (1 + reps / 30);

  return Math.round(oneRM * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculates the best estimated 1RM from a list of sets.
 *
 * This function:
 * - Filters out warmup sets (is_warmup: true)
 * - Filters out failure sets (is_failure: true)
 * - Only considers sets with 1-12 reps for accuracy
 * - Returns the highest estimated 1RM from valid sets
 *
 * @param {SetData[]} sets - Array of set data
 * @returns {number | null} Best estimated 1RM, or null if no valid sets
 *
 * @example
 * ```ts
 * const sets = [
 *   { weight: 50, reps: 10, is_warmup: true },
 *   { weight: 100, reps: 5, is_warmup: false },
 *   { weight: 110, reps: 3, is_warmup: false },
 * ];
 * const best1RM = getBestOneRM(sets); // Returns ~120.3
 * ```
 */
export function getBestOneRM(sets: SetData[]): number | null {
  if (!sets || sets.length === 0) {
    return null;
  }

  const validSets = sets.filter(
    (set) =>
      // Must have valid weight and reps
      set.weight > 0 &&
      set.reps > 0 &&
      // Exclude warmup sets
      !set.is_warmup &&
      // Exclude failure sets (may underestimate true capacity)
      !set.is_failure &&
      // Only use sets with 1-12 reps for formula accuracy
      set.reps >= 1 &&
      set.reps <= 12
  );

  if (validSets.length === 0) {
    return null;
  }

  const oneRMs = validSets.map((set) => calculateOneRM(set.weight, set.reps));

  return Math.max(...oneRMs);
}

/**
 * Calculates the percentage of 1RM that a given weight represents.
 *
 * @param {number} weight - The working weight
 * @param {number} oneRM - The one-rep max
 * @returns {number} Percentage of 1RM (0-100+)
 *
 * @example
 * ```ts
 * const percentage = getPercentageOfOneRM(80, 100); // Returns 80
 * ```
 */
export function getPercentageOfOneRM(weight: number, oneRM: number): number {
  if (oneRM <= 0 || weight < 0) {
    return 0;
  }

  return Math.round((weight / oneRM) * 100 * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculates the recommended weight for a target percentage of 1RM.
 *
 * @param {number} oneRM - The one-rep max
 * @param {number} percentage - Target percentage (0-100)
 * @returns {number} Recommended weight
 *
 * @example
 * ```ts
 * const weight = getWeightForPercentage(100, 80); // Returns 80
 * ```
 */
export function getWeightForPercentage(oneRM: number, percentage: number): number {
  if (oneRM <= 0 || percentage < 0 || percentage > 100) {
    return 0;
  }

  const weight = (oneRM * percentage) / 100;

  return Math.round(weight * 100) / 100; // Round to 2 decimal places
}

/**
 * Formatting utilities for displaying numbers, weights, percentages, and durations.
 */

export type WeightUnit = 'lbs' | 'kg';
export type DistanceUnit = 'miles' | 'km';

/**
 * Formats a weight value with the specified unit.
 *
 * @param {number} weight - Weight value
 * @param {WeightUnit} unit - Unit preference ('lbs' or 'kg')
 * @param {boolean} includeUnit - Whether to include the unit suffix
 * @returns {string} Formatted weight
 *
 * @example
 * ```ts
 * formatWeight(185, 'lbs'); // '185 lbs'
 * formatWeight(84.5, 'kg', false); // '84.5'
 * ```
 */
export function formatWeight(weight: number, unit: WeightUnit = 'lbs', includeUnit: boolean = true): string {
  if (!Number.isFinite(weight)) {
    return '0';
  }

  const formatted = weight % 1 === 0 ? weight.toString() : weight.toFixed(1);
  return includeUnit ? `${formatted} ${unit}` : formatted;
}

/**
 * Converts weight between units.
 *
 * @param {number} weight - Weight value
 * @param {WeightUnit} fromUnit - Source unit
 * @param {WeightUnit} toUnit - Target unit
 * @returns {number} Converted weight
 *
 * @example
 * ```ts
 * convertWeight(100, 'kg', 'lbs'); // Returns 220.46
 * convertWeight(220, 'lbs', 'kg'); // Returns 99.79
 * ```
 */
export function convertWeight(weight: number, fromUnit: WeightUnit, toUnit: WeightUnit): number {
  if (fromUnit === toUnit) {
    return weight;
  }

  if (fromUnit === 'kg' && toUnit === 'lbs') {
    return Math.round(weight * 2.20462 * 100) / 100;
  }

  if (fromUnit === 'lbs' && toUnit === 'kg') {
    return Math.round((weight / 2.20462) * 100) / 100;
  }

  return weight;
}

/**
 * Formats a percentage value.
 *
 * @param {number} value - Percentage value (0-100)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 *
 * @example
 * ```ts
 * formatPercentage(85.5); // '85.5%'
 * formatPercentage(85.567, 1); // '85.6%'
 * formatPercentage(100); // '100%'
 * ```
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (!Number.isFinite(value)) {
    return '0%';
  }

  const rounded = decimals === 0 ? Math.round(value) : Number(value.toFixed(decimals));
  return `${rounded}%`;
}

/**
 * Formats a duration in seconds to human-readable format.
 *
 * @param {number} seconds - Duration in seconds
 * @param {boolean} includeSeconds - Whether to include seconds in output
 * @returns {string} Formatted duration
 *
 * @example
 * ```ts
 * formatDuration(3665); // '1h 1m 5s'
 * formatDuration(3665, false); // '1h 1m'
 * formatDuration(125); // '2m 5s'
 * formatDuration(45); // '45s'
 * ```
 */
export function formatDuration(seconds: number, includeSeconds: boolean = true): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0s';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  if (includeSeconds && (secs > 0 || parts.length === 0)) {
    parts.push(`${secs}s`);
  }

  return parts.join(' ');
}

/**
 * Formats a number with appropriate decimal places.
 *
 * @param {number} value - Number to format
 * @param {number} maxDecimals - Maximum decimal places
 * @returns {string} Formatted number
 *
 * @example
 * ```ts
 * formatNumber(1234.5678); // '1,234.57'
 * formatNumber(1234, 0); // '1,234'
 * formatNumber(0.5, 1); // '0.5'
 * ```
 */
export function formatNumber(value: number, maxDecimals: number = 2): string {
  if (!Number.isFinite(value)) {
    return '0';
  }

  // Use toLocaleString for thousand separators
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Formats a distance value.
 *
 * @param {number} distance - Distance value
 * @param {DistanceUnit} unit - Unit preference
 * @param {boolean} includeUnit - Whether to include unit suffix
 * @returns {string} Formatted distance
 *
 * @example
 * ```ts
 * formatDistance(5.5, 'miles'); // '5.5 miles'
 * formatDistance(10, 'km'); // '10 km'
 * ```
 */
export function formatDistance(distance: number, unit: DistanceUnit = 'miles', includeUnit: boolean = true): string {
  if (!Number.isFinite(distance)) {
    return '0';
  }

  const formatted = distance % 1 === 0 ? distance.toString() : distance.toFixed(2);
  return includeUnit ? `${formatted} ${unit}` : formatted;
}

/**
 * Formats a body measurement (e.g., waist, chest) in inches.
 *
 * @param {number} measurement - Measurement in inches
 * @param {boolean} includeUnit - Whether to include unit suffix
 * @returns {string} Formatted measurement
 *
 * @example
 * ```ts
 * formatBodyMeasurement(32.5); // '32.5"'
 * formatBodyMeasurement(32.5, false); // '32.5'
 * ```
 */
export function formatBodyMeasurement(measurement: number, includeUnit: boolean = true): string {
  if (!Number.isFinite(measurement)) {
    return '0';
  }

  const formatted = measurement.toFixed(1);
  return includeUnit ? `${formatted}"` : formatted;
}

/**
 * Formats a heart rate value.
 *
 * @param {number} bpm - Beats per minute
 * @param {boolean} includeUnit - Whether to include 'bpm' suffix
 * @returns {string} Formatted heart rate
 *
 * @example
 * ```ts
 * formatHeartRate(72); // '72 bpm'
 * formatHeartRate(72, false); // '72'
 * ```
 */
export function formatHeartRate(bpm: number, includeUnit: boolean = true): string {
  if (!Number.isFinite(bpm) || bpm < 0) {
    return '0';
  }

  const rounded = Math.round(bpm);
  return includeUnit ? `${rounded} bpm` : rounded.toString();
}

/**
 * Formats an HRV (Heart Rate Variability) value.
 *
 * @param {number} hrv - HRV value in milliseconds
 * @param {boolean} includeUnit - Whether to include 'ms' suffix
 * @returns {string} Formatted HRV
 *
 * @example
 * ```ts
 * formatHRV(68); // '68 ms'
 * formatHRV(68.5, false); // '69'
 * ```
 */
export function formatHRV(hrv: number, includeUnit: boolean = true): string {
  if (!Number.isFinite(hrv) || hrv < 0) {
    return '0';
  }

  const rounded = Math.round(hrv);
  return includeUnit ? `${rounded} ms` : rounded.toString();
}

/**
 * Formats a calorie value.
 *
 * @param {number} calories - Calorie count
 * @param {boolean} includeUnit - Whether to include 'cal' suffix
 * @returns {string} Formatted calories
 *
 * @example
 * ```ts
 * formatCalories(2500); // '2,500 cal'
 * formatCalories(2500, false); // '2,500'
 * ```
 */
export function formatCalories(calories: number, includeUnit: boolean = true): string {
  if (!Number.isFinite(calories) || calories < 0) {
    return '0';
  }

  const rounded = Math.round(calories);
  const formatted = rounded.toLocaleString('en-US');
  return includeUnit ? `${formatted} cal` : formatted;
}

/**
 * Formats a rep count with proper pluralization.
 *
 * @param {number} reps - Number of reps
 * @returns {string} Formatted reps
 *
 * @example
 * ```ts
 * formatReps(1); // '1 rep'
 * formatReps(10); // '10 reps'
 * ```
 */
export function formatReps(reps: number): string {
  if (!Number.isFinite(reps) || reps < 0) {
    return '0 reps';
  }

  const rounded = Math.round(reps);
  return `${rounded} ${rounded === 1 ? 'rep' : 'reps'}`;
}

/**
 * Formats a set count with proper pluralization.
 *
 * @param {number} sets - Number of sets
 * @returns {string} Formatted sets
 *
 * @example
 * ```ts
 * formatSets(1); // '1 set'
 * formatSets(3); // '3 sets'
 * ```
 */
export function formatSets(sets: number): string {
  if (!Number.isFinite(sets) || sets < 0) {
    return '0 sets';
  }

  const rounded = Math.round(sets);
  return `${rounded} ${rounded === 1 ? 'set' : 'sets'}`;
}

/**
 * Formats a compact number with K/M suffixes.
 *
 * @param {number} value - Number to format
 * @returns {string} Compact formatted number
 *
 * @example
 * ```ts
 * formatCompactNumber(1500); // '1.5K'
 * formatCompactNumber(2500000); // '2.5M'
 * formatCompactNumber(750); // '750'
 * ```
 */
export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }

  const absValue = Math.abs(value);

  if (absValue >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (absValue >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toString();
}

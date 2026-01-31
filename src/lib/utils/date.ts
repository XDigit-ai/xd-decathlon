/**
 * Date formatting and manipulation utilities using date-fns.
 *
 * Provides consistent date handling across the application.
 */

import {
  format,
  formatDistanceToNow,
  startOfWeek as dateFnsStartOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  addDays,
  subDays,
  differenceInDays,
  parseISO,
  isValid,
} from 'date-fns';

/**
 * Formats a date using a standard format string.
 *
 * @param {Date | string} date - Date to format
 * @param {string} formatString - Format pattern (default: 'MMM d, yyyy')
 * @returns {string} Formatted date string
 *
 * @example
 * ```ts
 * formatDate(new Date('2024-01-15')); // 'Jan 15, 2024'
 * formatDate('2024-01-15', 'yyyy-MM-dd'); // '2024-01-15'
 * ```
 */
export function formatDate(date: Date | string, formatString: string = 'MMM d, yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    return format(dateObj, formatString);
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Formats a date relative to now (e.g., '2 days ago', 'in 3 weeks').
 *
 * @param {Date | string} date - Date to format
 * @returns {string} Relative date string
 *
 * @example
 * ```ts
 * formatRelative(new Date(Date.now() - 86400000)); // 'about 1 day ago'
 * ```
 */
export function formatRelative(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Gets the start of the week for a given date.
 *
 * Week starts on Monday by default (ISO 8601 standard).
 *
 * @param {Date | string} date - Reference date
 * @param {0 | 1 | 2 | 3 | 4 | 5 | 6} weekStartsOn - Day week starts (0=Sunday, 1=Monday)
 * @returns {Date} Start of week
 *
 * @example
 * ```ts
 * startOfWeek(new Date('2024-01-15')); // Monday of that week
 * startOfWeek(new Date('2024-01-15'), 0); // Sunday of that week
 * ```
 */
export function startOfWeek(
  date: Date | string,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1
): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsStartOfWeek(dateObj, { weekStartsOn });
}

/**
 * Gets the start and end dates for a week range.
 *
 * @param {Date | string} date - Reference date
 * @param {0 | 1 | 2 | 3 | 4 | 5 | 6} weekStartsOn - Day week starts
 * @returns {{ start: Date; end: Date }} Week range
 *
 * @example
 * ```ts
 * const { start, end } = getWeekRange(new Date());
 * console.log(`This week: ${formatDate(start)} - ${formatDate(end)}`);
 * ```
 */
export function getWeekRange(
  date: Date | string,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1
): { start: Date; end: Date } {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return {
    start: dateFnsStartOfWeek(dateObj, { weekStartsOn }),
    end: endOfWeek(dateObj, { weekStartsOn }),
  };
}

/**
 * Gets the start and end dates for a month range.
 *
 * @param {Date | string} date - Reference date
 * @returns {{ start: Date; end: Date }} Month range
 *
 * @example
 * ```ts
 * const { start, end } = getMonthRange(new Date());
 * ```
 */
export function getMonthRange(date: Date | string): { start: Date; end: Date } {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return {
    start: startOfMonth(dateObj),
    end: endOfMonth(dateObj),
  };
}

/**
 * Gets the start and end dates for a quarter range.
 *
 * @param {Date | string} date - Reference date
 * @returns {{ start: Date; end: Date }} Quarter range
 *
 * @example
 * ```ts
 * const { start, end } = getQuarterRange(new Date('2024-04-15'));
 * // Q2: April 1 - June 30
 * ```
 */
export function getQuarterRange(date: Date | string): { start: Date; end: Date } {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return {
    start: startOfQuarter(dateObj),
    end: endOfQuarter(dateObj),
  };
}

/**
 * Parses a mile time string in mm:ss format to total seconds.
 *
 * @param {string} timeString - Time in mm:ss format (e.g., '7:30')
 * @returns {number | null} Total seconds, or null if invalid
 *
 * @example
 * ```ts
 * parseMileTime('7:30'); // Returns 450
 * parseMileTime('6:45'); // Returns 405
 * parseMileTime('invalid'); // Returns null
 * ```
 */
export function parseMileTime(timeString: string): number | null {
  if (!timeString || typeof timeString !== 'string') {
    return null;
  }

  const parts = timeString.trim().split(':');
  if (parts.length !== 2) {
    return null;
  }

  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);

  if (isNaN(minutes) || isNaN(seconds) || seconds >= 60 || seconds < 0) {
    return null;
  }

  return minutes * 60 + seconds;
}

/**
 * Formats total seconds to mm:ss time string.
 *
 * @param {number} totalSeconds - Total seconds
 * @returns {string} Time in mm:ss format
 *
 * @example
 * ```ts
 * formatMileTime(450); // Returns '7:30'
 * formatMileTime(405); // Returns '6:45'
 * formatMileTime(65); // Returns '1:05'
 * ```
 */
export function formatMileTime(totalSeconds: number): string {
  if (totalSeconds < 0 || !Number.isFinite(totalSeconds)) {
    return '0:00';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Gets an array of dates between two dates (inclusive).
 *
 * @param {Date | string} startDate - Start date
 * @param {Date | string} endDate - End date
 * @returns {Date[]} Array of dates
 *
 * @example
 * ```ts
 * const dates = getDateRange('2024-01-01', '2024-01-07');
 * // Returns 7 dates from Jan 1 to Jan 7
 * ```
 */
export function getDateRange(startDate: Date | string, endDate: Date | string): Date[] {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  const dates: Date[] = [];
  const daysDiff = differenceInDays(end, start);

  if (daysDiff < 0) {
    return dates;
  }

  for (let i = 0; i <= daysDiff; i++) {
    dates.push(addDays(start, i));
  }

  return dates;
}

/**
 * Formats a date for database storage (ISO 8601 format).
 *
 * @param {Date | string} date - Date to format
 * @returns {string} ISO 8601 date string
 *
 * @example
 * ```ts
 * formatForDB(new Date('2024-01-15')); // '2024-01-15T00:00:00.000Z'
 * ```
 */
export function formatForDB(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj.toISOString();
}

/**
 * Checks if a date is today.
 *
 * @param {Date | string} date - Date to check
 * @returns {boolean} True if date is today
 *
 * @example
 * ```ts
 * isToday(new Date()); // true
 * ```
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Gets the number of days between two dates.
 *
 * @param {Date | string} startDate - Start date
 * @param {Date | string} endDate - End date
 * @returns {number} Number of days (can be negative)
 *
 * @example
 * ```ts
 * getDaysBetween('2024-01-01', '2024-01-08'); // Returns 7
 * ```
 */
export function getDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  return differenceInDays(end, start);
}

/**
 * Gets a date N days ago from today.
 *
 * @param {number} days - Number of days ago
 * @returns {Date} Date N days ago
 *
 * @example
 * ```ts
 * const lastWeek = getDaysAgo(7);
 * ```
 */
export function getDaysAgo(days: number): Date {
  return subDays(new Date(), days);
}

/**
 * Gets a date N days from today.
 *
 * @param {number} days - Number of days ahead
 * @returns {Date} Date N days from now
 *
 * @example
 * ```ts
 * const nextWeek = getDaysFromNow(7);
 * ```
 */
export function getDaysFromNow(days: number): Date {
  return addDays(new Date(), days);
}

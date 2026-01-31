/**
 * Tailwind CSS class merge utility.
 *
 * Combines clsx for conditional classes with tailwind-merge to intelligently
 * merge Tailwind CSS classes, resolving conflicts (e.g., 'px-2' overrides 'px-4').
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with Tailwind CSS conflict resolution.
 *
 * This utility function:
 * - Accepts any number of class name inputs (strings, arrays, objects, etc.)
 * - Handles conditional classes using clsx
 * - Intelligently merges Tailwind classes to resolve conflicts
 *
 * @param {...ClassValue[]} inputs - Class name inputs
 * @returns {string} Merged class names string
 *
 * @example
 * ```tsx
 * // Basic usage
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4' (px-4 overrides px-2)
 *
 * // Conditional classes
 * cn('text-base', isActive && 'text-blue-500') // Conditionally applies text-blue-500
 *
 * // Object syntax
 * cn({
 *   'bg-blue-500': isPrimary,
 *   'bg-gray-500': !isPrimary,
 * })
 *
 * // Array syntax
 * cn(['px-4', 'py-2'], { 'bg-red-500': hasError })
 *
 * // Complex example in a component
 * <button
 *   className={cn(
 *     'px-4 py-2 rounded-md font-medium',
 *     'hover:bg-opacity-90 transition-colors',
 *     variant === 'primary' && 'bg-blue-500 text-white',
 *     variant === 'secondary' && 'bg-gray-200 text-gray-900',
 *     disabled && 'opacity-50 cursor-not-allowed',
 *     className // Allow prop-based overrides
 *   )}
 * >
 *   {children}
 * </button>
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

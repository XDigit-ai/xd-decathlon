import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  return `${secs}s`;
}

export function formatTimeMinutes(totalMinutes: string | number): string {
  const mins = typeof totalMinutes === "string" ? parseFloat(totalMinutes) : totalMinutes;
  const wholeMins = Math.floor(mins);
  const secs = Math.round((mins - wholeMins) * 60);
  return `${wholeMins}:${secs.toString().padStart(2, "0")}`;
}

export function calculateEpley1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps > 12) return weight; // Not reliable beyond 12 reps
  return weight * (1 + reps / 30);
}

export function calculateRollingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    result.push(avg);
  }
  return result;
}

export function getRecoveryStatus(hrv: number, baseline: number): {
  status: "green" | "yellow" | "red";
  label: string;
  recommendation: string;
} {
  const ratio = hrv / baseline;

  if (ratio >= 0.95) {
    return {
      status: "green",
      label: "Optimal",
      recommendation: "You're fully recovered. Great day for high-intensity training!",
    };
  } else if (ratio >= 0.90) {
    return {
      status: "yellow",
      label: "Moderate",
      recommendation: "Consider moderate intensity today. Focus on technique or Zone 2 cardio.",
    };
  } else {
    return {
      status: "red",
      label: "Recovery Needed",
      recommendation: "Prioritize rest and recovery. Light movement or mobility work only.",
    };
  }
}

export function calculateWeeklyProgress(
  current: number,
  target: number,
  baseline: number,
  isLowerBetter: boolean = false
): { percentage: number; status: "ahead" | "on-track" | "behind" } {
  const totalChange = isLowerBetter ? baseline - target : target - baseline;
  const actualChange = isLowerBetter ? baseline - current : current - baseline;

  if (totalChange === 0) return { percentage: 100, status: "on-track" };

  const percentage = Math.min(100, Math.max(0, (actualChange / totalChange) * 100));

  if (percentage >= 100) return { percentage, status: "ahead" };
  if (percentage >= 80) return { percentage, status: "on-track" };
  return { percentage, status: "behind" };
}

export function daysUntilNextReview(reviewType: "weekly" | "monthly" | "quarterly"): number {
  const today = new Date();
  const dayOfWeek = today.getDay();

  if (reviewType === "weekly") {
    // Weekly review is on Sunday (0)
    return dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  }

  if (reviewType === "monthly") {
    // First weekend of month
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const firstSaturday = new Date(nextMonth);
    while (firstSaturday.getDay() !== 6) {
      firstSaturday.setDate(firstSaturday.getDate() + 1);
    }
    const diff = firstSaturday.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Quarterly - first month of quarter
  const quarter = Math.floor(today.getMonth() / 3);
  const nextQuarterStart = new Date(today.getFullYear(), (quarter + 1) * 3, 1);
  const diff = nextQuarterStart.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

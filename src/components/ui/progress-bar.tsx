"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "green" | "yellow" | "red" | "gradient";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  size = "md",
  color = "blue",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1 flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700",
          {
            "h-1.5": size === "sm",
            "h-2.5": size === "md",
            "h-4": size === "lg",
          }
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", {
            "bg-blue-500": color === "blue",
            "bg-green-500": color === "green",
            "bg-yellow-500": color === "yellow",
            "bg-red-500": color === "red",
            "bg-gradient-to-r from-blue-500 to-green-500": color === "gradient",
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

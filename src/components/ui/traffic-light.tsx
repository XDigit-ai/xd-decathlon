"use client";

import { cn } from "@/lib/utils";

interface TrafficLightProps {
  status: "green" | "yellow" | "red";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function TrafficLight({
  status,
  size = "md",
  showLabel = false,
  label,
  className,
}: TrafficLightProps) {
  const statusLabel = label || (status === "green" ? "Optimal" : status === "yellow" ? "Moderate" : "Recovery Needed");

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full shadow-lg transition-all",
          {
            "h-4 w-4": size === "sm",
            "h-6 w-6": size === "md",
            "h-10 w-10": size === "lg",
          },
          {
            "bg-green-500 shadow-green-500/50": status === "green",
            "bg-yellow-500 shadow-yellow-500/50": status === "yellow",
            "bg-red-500 shadow-red-500/50": status === "red",
          }
        )}
      />
      {showLabel && (
        <span
          className={cn("font-medium", {
            "text-sm": size === "sm",
            "text-base": size === "md",
            "text-lg": size === "lg",
            "text-green-600 dark:text-green-400": status === "green",
            "text-yellow-600 dark:text-yellow-400": status === "yellow",
            "text-red-600 dark:text-red-400": status === "red",
          })}
        >
          {statusLabel}
        </span>
      )}
    </div>
  );
}

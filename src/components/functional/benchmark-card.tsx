"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { Trophy, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BenchmarkCardProps {
  name: string;
  target: number;
  unit: string;
  current: number | null;
  best: number | null;
  lastTested: string | null;
  isPR: boolean;
  isInverted?: boolean; // For mile_run where lower is better
  isPassFail?: boolean; // For floor_getup
  variant?: 'left' | 'right' | null; // For L/R tests
}

// Format seconds as mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function BenchmarkCard({
  name,
  target,
  unit,
  current,
  best,
  lastTested,
  isPR,
  isInverted = false,
  isPassFail = false,
  variant = null,
}: BenchmarkCardProps) {
  // Calculate progress percentage
  let progressPercent = 0;
  if (current !== null) {
    if (isInverted) {
      // For inverted tests (mile_run), lower is better
      // If current is less than target, that's > 100%
      // If current equals target, that's 100%
      // If current is more than target, that's < 100%
      progressPercent = Math.min((target / current) * 100, 150);
    } else {
      progressPercent = Math.min((current / target) * 100, 150);
    }
  }

  // Determine color based on progress
  let progressColor = "bg-gray-300";
  let statusColor = "text-gray-500";

  if (current !== null) {
    if (progressPercent >= 100) {
      progressColor = "bg-green-500";
      statusColor = "text-green-600";
    } else if (progressPercent >= 70) {
      progressColor = "bg-yellow-500";
      statusColor = "text-yellow-600";
    } else {
      progressColor = "bg-red-500";
      statusColor = "text-red-600";
    }
  }

  // Format display value
  const formatValue = (value: number | null) => {
    if (value === null) return "—";
    if (unit === "seconds" && !isPassFail) {
      return formatTime(value);
    }
    if (isPassFail) {
      return value === 0 ? "Pass" : `${value} ${unit}`;
    }
    return value.toFixed(value % 1 === 0 ? 0 : 1);
  };

  const displayCurrent = formatValue(current);
  const displayBest = formatValue(best);
  const displayTarget = isPassFail ? "0 arms" : (unit === "seconds" ? formatTime(target) : target.toString());

  return (
    <Card className={cn("relative", current === null && "opacity-75")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {name}
              {variant && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({variant === 'left' ? 'Left' : 'Right'})
                </span>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Target: {displayTarget} {!isPassFail && unit}
            </p>
          </div>
          {isPR && current !== null && (
            <Badge variant="default" className="ml-2">
              <Trophy className="h-3 w-3 mr-1" />
              PR
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {current !== null ? (
          <>
            {/* Current Value */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-3xl font-bold", statusColor)}>
                    {displayCurrent}
                  </span>
                  {!isPassFail && (
                    <span className="text-sm text-muted-foreground">{unit}</span>
                  )}
                </div>
                {best !== current && best !== null && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Best</p>
                    <p className="text-sm font-semibold">{displayBest}</p>
                  </div>
                )}
              </div>

              {/* Progress Bar (only for non-pass/fail tests) */}
              {!isPassFail && (
                <div className="space-y-1">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full transition-all", progressColor)}
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {progressPercent.toFixed(0)}% of target
                    </span>
                    {progressPercent >= 100 && (
                      <span className="text-green-600 font-medium">
                        Target achieved!
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Last Tested */}
            {lastTested && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t">
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(lastTested), { addSuffix: true })}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">Never tested</p>
            <p className="text-xs text-muted-foreground mt-1">
              Record your first test to start tracking
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

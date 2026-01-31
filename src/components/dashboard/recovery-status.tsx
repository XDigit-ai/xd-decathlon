import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Activity, Moon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RecoveryStatusProps {
  status: "green" | "yellow" | "red";
  message: string;
  hrv: number;
  rhr: number;
  sleepHours: number;
  className?: string;
}

const statusConfig = {
  green: {
    color: "bg-green-500",
    textColor: "text-green-500",
    label: "Optimal Recovery",
    borderColor: "border-green-500/20",
  },
  yellow: {
    color: "bg-yellow-500",
    textColor: "text-yellow-500",
    label: "Moderate Recovery",
    borderColor: "border-yellow-500/20",
  },
  red: {
    color: "bg-red-500",
    textColor: "text-red-500",
    label: "Low Recovery",
    borderColor: "border-red-500/20",
  },
};

export function RecoveryStatus({
  status,
  message,
  hrv,
  rhr,
  sleepHours,
  className,
}: RecoveryStatusProps) {
  const config = statusConfig[status];

  return (
    <Card className={cn("border-2", config.borderColor, className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recovery Status</CardTitle>
          <Badge
            variant="outline"
            className={cn("border-2", config.borderColor, config.textColor)}
          >
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Traffic light indicator */}
        <div className="flex items-center gap-4">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-border bg-card">
            <div
              className={cn(
                "h-20 w-20 rounded-full shadow-lg",
                config.color
              )}
            >
              <div
                className={cn(
                  "h-20 w-20 animate-pulse rounded-full opacity-50",
                  config.color
                )}
              />
            </div>
          </div>

          {/* Recommendation */}
          <div className="flex-1">
            <h4 className="mb-1 font-semibold">Recommendation</h4>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>

        <Separator />

        {/* Supporting metrics */}
        <div className="grid grid-cols-3 gap-4">
          {/* HRV */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>HRV</span>
            </div>
            <div className="text-2xl font-bold">{hrv}</div>
            <p className="text-xs text-muted-foreground">ms</p>
          </div>

          {/* RHR */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>RHR</span>
            </div>
            <div className="text-2xl font-bold">{rhr}</div>
            <p className="text-xs text-muted-foreground">bpm</p>
          </div>

          {/* Sleep */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Moon className="h-4 w-4" />
              <span>Sleep</span>
            </div>
            <div className="text-2xl font-bold">{sleepHours}</div>
            <p className="text-xs text-muted-foreground">hours</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

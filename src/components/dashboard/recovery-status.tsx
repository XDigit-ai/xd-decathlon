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
    color: "bg-emerald-500",
    textColor: "text-emerald-500",
    label: "Optimal Recovery",
    borderColor: "border-emerald-500/20",
    glowColor: "shadow-emerald-500/20",
  },
  yellow: {
    color: "bg-amber-500",
    textColor: "text-amber-500",
    label: "Moderate Recovery",
    borderColor: "border-amber-500/20",
    glowColor: "shadow-amber-500/20",
  },
  red: {
    color: "bg-rose-500",
    textColor: "text-rose-500",
    label: "Low Recovery",
    borderColor: "border-rose-500/20",
    glowColor: "shadow-rose-500/20",
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
    <Card className={cn("overflow-hidden border-2", config.borderColor, className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Recovery Status</CardTitle>
          <Badge
            variant="outline"
            className={cn("border-2 font-semibold", config.borderColor, config.textColor)}
          >
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50">
            <div
              className={cn(
                "h-20 w-20 rounded-full shadow-2xl",
                config.color,
                config.glowColor
              )}
            >
              <div
                className={cn(
                  "h-20 w-20 animate-pulse rounded-full opacity-40",
                  config.color
                )}
              />
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <h4 className="font-semibold text-foreground">Recommendation</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
          </div>
        </div>

        <Separator className="bg-border/50" />

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>HRV</span>
            </div>
            <div className="text-3xl font-bold tracking-tight">{hrv}</div>
            <p className="text-xs font-medium text-muted-foreground">ms</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>RHR</span>
            </div>
            <div className="text-3xl font-bold tracking-tight">{rhr}</div>
            <p className="text-xs font-medium text-muted-foreground">bpm</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Moon className="h-4 w-4" />
              <span>Sleep</span>
            </div>
            <div className="text-3xl font-bold tracking-tight">{sleepHours}</div>
            <p className="text-xs font-medium text-muted-foreground">hours</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface StatusCardProps {
  title: string;
  icon: LucideIcon;
  value: string;
  label: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "flat";
  };
  className?: string;
}

export function StatusCard({
  title,
  icon: Icon,
  value,
  label,
  trend,
  className,
}: StatusCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend.direction) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "flat":
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return "";

    switch (trend.direction) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      case "flat":
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={cn("group relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
        <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>

          <div className="mt-4 h-12 w-full">
            <div className="flex h-full items-end gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/30 to-primary/10 transition-all duration-300 group-hover:from-primary/40 group-hover:to-primary/20"
                  style={{
                    height: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>

          {trend && (
            <div className="flex items-center gap-1.5 pt-2">
              {getTrendIcon()}
              <span className={cn("text-xs font-semibold", getTrendColor())}>
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

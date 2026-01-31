"use client";

import { Card, CardContent, Sparkline } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { DomainStatus } from "@/types";
import { Activity, Dumbbell, Heart, Scale, Zap } from "lucide-react";
import Link from "next/link";

interface DomainStatusCardProps {
  domain: DomainStatus;
}

const domainIcons = {
  body: Scale,
  strength: Dumbbell,
  cardio: Activity,
  recovery: Heart,
  functional: Zap,
};

const domainColors = {
  body: "text-purple-500",
  strength: "text-blue-500",
  cardio: "text-orange-500",
  recovery: "text-red-500",
  functional: "text-green-500",
};

const domainBgColors = {
  body: "bg-purple-100 dark:bg-purple-900/30",
  strength: "bg-blue-100 dark:bg-blue-900/30",
  cardio: "bg-orange-100 dark:bg-orange-900/30",
  recovery: "bg-red-100 dark:bg-red-900/30",
  functional: "bg-green-100 dark:bg-green-900/30",
};

const sparklineColors = {
  body: "#a855f7",
  strength: "#3b82f6",
  cardio: "#f97316",
  recovery: "#ef4444",
  functional: "#22c55e",
};

const domainLinks = {
  body: "/body",
  strength: "/strength",
  cardio: "/cardio",
  recovery: "/recovery",
  functional: "/functional",
};

export function DomainStatusCard({ domain }: DomainStatusCardProps) {
  const Icon = domainIcons[domain.domain];

  return (
    <Link href={domainLinks[domain.domain]}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg p-2", domainBgColors[domain.domain])}>
                <Icon className={cn("h-5 w-5", domainColors[domain.domain])} />
              </div>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                  {domain.label}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {domain.mainMetric.value}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {domain.mainMetric.unit}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {domain.mainMetric.label}
                </p>
              </div>
            </div>

            {domain.trend.length > 1 && (
              <Sparkline
                data={domain.trend}
                width={80}
                height={40}
                color={sparklineColors[domain.domain]}
                showArea
              />
            )}
          </div>

          {/* Status indicator */}
          <div className="mt-3 flex items-center gap-2">
            <div
              className={cn("h-2 w-2 rounded-full", {
                "bg-green-500": domain.status === "ahead",
                "bg-blue-500": domain.status === "on-track",
                "bg-yellow-500": domain.status === "behind",
              })}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
              {domain.status.replace("-", " ")}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface DomainStatusGridProps {
  domains: DomainStatus[];
}

export function DomainStatusGrid({ domains }: DomainStatusGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {domains.map((domain) => (
        <DomainStatusCard key={domain.domain} domain={domain} />
      ))}
    </div>
  );
}

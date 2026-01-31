'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, AlertCircle, Trophy } from 'lucide-react';
import type { TargetWithProgress } from '@/types/targets';

interface ProgressSummaryProps {
  targets: TargetWithProgress[];
}

export function ProgressSummary({ targets }: ProgressSummaryProps) {
  const totalTargets = targets.length;

  // Calculate on-track targets (using 12m as primary timeline)
  const onTrackTargets = targets.filter((t) => t.on_track_12m).length;

  // Calculate needs-attention targets (progress < 50% of expected)
  const needsAttentionTargets = targets.filter((t) => {
    const expectedProgress = (t.days_elapsed / 365) * 100;
    return t.progress_percentage < expectedProgress * 0.5;
  }).length;

  // Calculate average progress
  const averageProgress =
    totalTargets > 0
      ? targets.reduce((sum, t) => sum + t.progress_percentage, 0) / totalTargets
      : 0;

  const stats = [
    {
      label: 'Total Targets',
      value: totalTargets,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'On Track',
      value: onTrackTargets,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Needs Attention',
      value: needsAttentionTargets,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Avg. Progress',
      value: `${Math.round(averageProgress)}%`,
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

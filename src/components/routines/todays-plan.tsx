'use client';

import { getTodaysPlan, getCurrentPhase, type TrainingDay, type Phase } from '@/lib/training-plan';
import type { RecoveryAdjustment } from '@/lib/calculations/recovery-adjustments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import { CardioCompliance } from './cardio-compliance';

const typeBadge: Record<TrainingDay['type'], { label: string; className: string }> = {
  strength: { label: 'Strength', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  hiit: { label: 'HIIT', className: 'bg-orange-500/15 text-orange-700 dark:text-orange-400' },
  cardio: { label: 'Zone 2', className: 'bg-teal-500/15 text-teal-700 dark:text-teal-400' },
  mobility: { label: 'Mobility', className: 'bg-purple-500/15 text-purple-700 dark:text-purple-400' },
  rest: { label: 'Rest', className: 'bg-gray-500/15 text-gray-700 dark:text-gray-400' },
};

interface TodaysPlanProps {
  programStartDate?: Date;
  recoveryAdjustment?: RecoveryAdjustment;
}

export function TodaysPlan({ programStartDate, recoveryAdjustment }: TodaysPlanProps) {
  const startDate = programStartDate ?? new Date('2025-02-03'); // Fallback if not fetched from profile
  const phase = getCurrentPhase(startDate);
  const plan = getTodaysPlan(phase);
  const badge = typeBadge[plan.type];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {plan.label} — {plan.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{plan.duration}</span>
              <span className="text-xs">• Phase {phase}</span>
            </div>
          </div>
          <Badge className={cn('border-0', badge.className)}>{badge.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Recovery adjustment banner */}
        {recoveryAdjustment && recoveryAdjustment.severity !== 'none' && (
          <div className={cn(
            "rounded-lg p-3 text-sm",
            recoveryAdjustment.severity === 'skip' && "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900",
            recoveryAdjustment.severity === 'reduce' && "bg-orange-50 text-orange-800 border border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900",
            recoveryAdjustment.severity === 'caution' && "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900",
          )}>
            {recoveryAdjustment.message}
          </div>
        )}

        {/* Warm-up */}
        {plan.warmUp.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Warm-Up
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {plan.warmUp.map((w) => (
                <span key={w.name}>
                  {w.name} <span className="text-foreground/70">({w.prescription})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Exercises table */}
        {plan.exercises.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-2">#</th>
                  <th className="pb-2 pr-2">Exercise</th>
                  <th className="pb-2 pr-2">Sets</th>
                  <th className="pb-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {plan.exercises.map((ex, i) => {
                  const isSkipped = recoveryAdjustment?.skipExercises.includes(ex.name);
                  const isReduced = recoveryAdjustment && recoveryAdjustment.volumeModifier < 1.0 && !isSkipped;

                  return (
                    <tr key={ex.name} className={cn("border-b border-border/50 last:border-0", isSkipped && "opacity-50")}>
                      <td className="py-2 pr-2 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 pr-2 font-medium">
                        <span className={cn(isSkipped && "line-through")}>{ex.name}</span>
                        {isSkipped && (
                          <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 border-red-300 text-red-600 dark:border-red-800 dark:text-red-400">
                            Skipped
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 pr-2">{ex.sets}</td>
                      <td className="py-2 text-xs text-muted-foreground max-w-[200px] truncate">
                        {isReduced ? (
                          <span className="text-orange-600 dark:text-orange-400">Reduce sets ~{Math.round((1 - recoveryAdjustment.volumeModifier) * 100)}%</span>
                        ) : (
                          ex.notes || '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Cardio compliance for HIIT/cardio days */}
        {plan.hrZones && plan.hrZones.length > 0 && (
          <CardioCompliance hrZones={plan.hrZones} />
        )}

        {/* Modality Options */}
        {plan.modality && plan.modality.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground">Options:</span>
            {plan.modality.map((m) => (
              <span key={m} className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                {m}
              </span>
            ))}
          </div>
        )}

        {/* Notes (Zone 2 / Rest days) */}
        {plan.notes && plan.exercises.length === 0 && (
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Protocol
            </p>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{plan.notes}</pre>
          </div>
        )}

        {/* Notes shown below exercises if present */}
        {plan.notes && plan.exercises.length > 0 && (
          <p className="text-sm text-muted-foreground italic">{plan.notes}</p>
        )}

        {/* Link to full schedule */}
        <Link
          href="/routines/schedule"
          className="group mt-2 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View full schedule
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardContent>
    </Card>
  );
}

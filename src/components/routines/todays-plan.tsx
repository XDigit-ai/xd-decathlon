import { getTodaysPlan, type TrainingDay } from '@/lib/training-plan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

const typeBadge: Record<TrainingDay['type'], { label: string; className: string }> = {
  strength: { label: 'Strength', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  hiit: { label: 'HIIT', className: 'bg-orange-500/15 text-orange-700 dark:text-orange-400' },
  zone2: { label: 'Zone 2', className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
  recovery: { label: 'Recovery', className: 'bg-purple-500/15 text-purple-700 dark:text-purple-400' },
};

export function TodaysPlan() {
  const plan = getTodaysPlan();
  const badge = typeBadge[plan.type];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{plan.label} — {plan.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{plan.duration}</span>
            </div>
          </div>
          <Badge className={cn('border-0', badge.className)}>{badge.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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

        {/* Exercises table (strength / recovery days) */}
        {plan.exercises.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-2">#</th>
                  <th className="pb-2 pr-2">Exercise</th>
                  <th className="pb-2 pr-2">Sets × Reps</th>
                  {plan.type !== 'recovery' && (
                    <>
                      <th className="pb-2 pr-2">RIR</th>
                      <th className="pb-2">Rest</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {plan.exercises.map((ex, i) => (
                  <tr key={ex.name} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-2 pr-2 font-medium">
                      {ex.name}
                      {ex.notes && (
                        <span className="ml-1 text-xs text-muted-foreground">({ex.notes})</span>
                      )}
                    </td>
                    <td className="py-2 pr-2">{ex.sets}</td>
                    {plan.type !== 'recovery' && (
                      <>
                        <td className="py-2 pr-2">{ex.rir}</td>
                        <td className="py-2">{ex.rest}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes (HIIT / Zone 2 days) */}
        {plan.notes && plan.exercises.length === 0 && (
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Protocol
            </p>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{plan.notes}</pre>
          </div>
        )}

        {/* Recovery notes shown below the exercises table */}
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

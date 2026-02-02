import { getAuthUser } from '@/lib/supabase/auth';
import { TRAINING_PLAN, type TrainingDay } from '@/lib/training-plan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const typeBadge: Record<TrainingDay['type'], { label: string; className: string }> = {
  strength: { label: 'Strength', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  hiit: { label: 'HIIT', className: 'bg-orange-500/15 text-orange-700 dark:text-orange-400' },
  zone2: { label: 'Zone 2', className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
  recovery: { label: 'Recovery', className: 'bg-purple-500/15 text-purple-700 dark:text-purple-400' },
};

function getTodayIndex(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export default async function SchedulePage() {
  await getAuthUser();
  const todayIndex = getTodayIndex();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Training Schedule</h1>
        <p className="mt-2 text-muted-foreground">
          Your weekly program based on your training plan
        </p>
      </div>

      <div className="space-y-4">
        {TRAINING_PLAN.map((day) => {
          const badge = typeBadge[day.type];
          const isToday = day.dayIndex === todayIndex;

          return (
            <Card
              key={day.dayIndex}
              className={cn(isToday && 'ring-2 ring-primary/30')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">
                      {day.label}
                      {isToday && (
                        <span className="ml-2 text-xs font-normal text-primary">(Today)</span>
                      )}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">—</span>
                    <span className="text-sm font-medium">{day.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{day.duration}</span>
                    </div>
                    <Badge className={cn('border-0', badge.className)}>{badge.label}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Warm-up */}
                {day.warmUp.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Warm-Up
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {day.warmUp.map((w) => (
                        <span key={w.name}>
                          {w.name}{' '}
                          <span className="text-foreground/70">({w.prescription})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exercises table */}
                {day.exercises.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <th className="pb-2 pr-2">#</th>
                          <th className="pb-2 pr-2">Exercise</th>
                          <th className="pb-2 pr-2">Sets × Reps</th>
                          {day.type !== 'recovery' && (
                            <>
                              <th className="pb-2 pr-2">RIR</th>
                              <th className="pb-2">Rest</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {day.exercises.map((ex, i) => (
                          <tr
                            key={ex.name}
                            className="border-b border-border/50 last:border-0"
                          >
                            <td className="py-2 pr-2 text-muted-foreground">{i + 1}</td>
                            <td className="py-2 pr-2 font-medium">
                              {ex.name}
                              {ex.notes && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({ex.notes})
                                </span>
                              )}
                            </td>
                            <td className="py-2 pr-2">{ex.sets}</td>
                            {day.type !== 'recovery' && (
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

                {/* Notes (HIIT / Zone 2) */}
                {day.notes && day.exercises.length === 0 && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Protocol
                    </p>
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                      {day.notes}
                    </pre>
                  </div>
                )}

                {/* Recovery notes below exercises */}
                {day.notes && day.exercises.length > 0 && (
                  <p className="text-sm text-muted-foreground italic">{day.notes}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

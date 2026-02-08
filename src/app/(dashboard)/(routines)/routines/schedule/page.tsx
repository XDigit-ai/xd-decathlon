import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/supabase/auth';
import { getWeekSchedule, getCurrentPhase, type TrainingDay } from '@/lib/training-plan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const typeBadge: Record<TrainingDay['type'], { label: string; className: string }> = {
  strength: { label: 'Strength', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  hiit: { label: 'HIIT', className: 'bg-orange-500/15 text-orange-700 dark:text-orange-400' },
  cardio: { label: 'Zone 2', className: 'bg-teal-500/15 text-teal-700 dark:text-teal-400' },
  mobility: { label: 'Mobility', className: 'bg-purple-500/15 text-purple-700 dark:text-purple-400' },
  rest: { label: 'Rest', className: 'bg-gray-500/15 text-gray-700 dark:text-gray-400' },
};

function getTodayIndex(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export default async function SchedulePage() {
  const user = await getAuthUser();
  const supabase = await createClient();
  const todayIndex = getTodayIndex();

  const profileResult = await supabase
    .from('profiles')
    .select('program_start_date')
    .eq('id', user.id)
    .maybeSingle();

  const programStartDate = profileResult.data?.program_start_date
    ? new Date(profileResult.data.program_start_date)
    : new Date('2025-02-03'); // fallback
  const phase = getCurrentPhase(programStartDate);
  const schedule = getWeekSchedule(phase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Training Schedule</h1>
        <p className="mt-2 text-muted-foreground">
          Your weekly program — Phase {phase} (Weeks {phase === 1 ? '1-6' : '7-12'})
        </p>
      </div>

      <div className="space-y-4">
        {schedule.map((day: TrainingDay) => {
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
                          <th className="pb-2 pr-2">Sets</th>
                          <th className="pb-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {day.exercises.map((ex, i) => (
                          <tr
                            key={ex.name}
                            className="border-b border-border/50 last:border-0"
                          >
                            <td className="py-2 pr-2 text-muted-foreground">{i + 1}</td>
                            <td className="py-2 pr-2 font-medium">{ex.name}</td>
                            <td className="py-2 pr-2">{ex.sets}</td>
                            <td className="py-2 text-xs text-muted-foreground max-w-[300px]">
                              {ex.notes || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* HR Zone Targets */}
                {day.hrZones && day.hrZones.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      HR Zone Targets
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {day.hrZones.map((hz) => (
                        <div key={hz.zone} className="rounded-lg bg-muted/50 p-2 text-center">
                          <p className="text-xs text-muted-foreground">Zone {hz.zone}</p>
                          <p className="text-sm font-semibold">{hz.targetMinutes} min</p>
                          <p className="text-xs text-muted-foreground">{hz.bpmRange} bpm</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modality Options */}
                {day.modality && day.modality.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs text-muted-foreground">Options:</span>
                    {day.modality.map((m) => (
                      <span key={m} className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                        {m}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes (Zone 2 / Rest) */}
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

                {/* Notes below exercises if present */}
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

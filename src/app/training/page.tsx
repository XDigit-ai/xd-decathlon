"use client";

import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabContent, TabList, TabTrigger } from "@/components/ui";
import { calculateHRZones, WEEKLY_TRAINING_SCHEDULE } from "@/types";
import { Activity, Calendar, Dumbbell, Heart, Target, Utensils, Zap } from "lucide-react";

export default function TrainingPage() {
  const hrZones = calculateHRZones(56, 178);

  return (
    <AppLayout title="Training Plan" subtitle="Weekly schedule and program reference">
      <div className="space-y-6">
        <Tabs defaultValue="schedule">
          <TabList>
            <TabTrigger value="schedule">Weekly Schedule</TabTrigger>
            <TabTrigger value="zones">HR Zones</TabTrigger>
            <TabTrigger value="nutrition">Nutrition</TabTrigger>
            <TabTrigger value="progression">Progression</TabTrigger>
          </TabList>

          <TabContent value="schedule">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {WEEKLY_TRAINING_SCHEDULE.map((day) => (
                <Card
                  key={day.day}
                  className={
                    day.type === "rest"
                      ? "border-zinc-300 dark:border-zinc-600"
                      : day.type === "strength"
                      ? "border-blue-200 dark:border-blue-800"
                      : day.type === "cardio"
                      ? "border-orange-200 dark:border-orange-800"
                      : "border-green-200 dark:border-green-800"
                  }
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{day.day}</span>
                      <div
                        className={`rounded-lg p-2 ${
                          day.type === "rest"
                            ? "bg-zinc-100 dark:bg-zinc-800"
                            : day.type === "strength"
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : day.type === "cardio"
                            ? "bg-orange-100 dark:bg-orange-900/30"
                            : "bg-green-100 dark:bg-green-900/30"
                        }`}
                      >
                        {day.type === "strength" && <Dumbbell className="h-4 w-4 text-blue-500" />}
                        {day.type === "cardio" && <Activity className="h-4 w-4 text-orange-500" />}
                        {day.type === "rest" && <Calendar className="h-4 w-4 text-zinc-500" />}
                        {day.type === "active_recovery" && <Zap className="h-4 w-4 text-green-500" />}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">{day.title}</h3>
                    <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">{day.description}</p>

                    {day.exercises && (
                      <div className="space-y-2">
                        {day.exercises.map((exercise, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-zinc-700 dark:text-zinc-300">{exercise.name}</span>
                            <span className="text-zinc-500 dark:text-zinc-400">
                              {exercise.sets}x{exercise.reps} @{exercise.rir}RIR
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabContent>

          <TabContent value="zones">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Heart Rate Zones (Karvonen Method)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                  <div className="grid gap-4 sm:grid-cols-3 text-center">
                    <div>
                      <p className="text-sm text-zinc-500">Resting HR</p>
                      <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">56 bpm</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Max HR</p>
                      <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">178 bpm</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Heart Rate Reserve</p>
                      <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">122 bpm</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {hrZones.map((zone) => (
                    <div
                      key={zone.zone}
                      className="flex items-center gap-4 rounded-lg p-4"
                      style={{ backgroundColor: `${zone.color}15` }}
                    >
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full text-white text-lg font-bold"
                        style={{ backgroundColor: zone.color }}
                      >
                        {zone.zone}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{zone.name}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {zone.minPercent}% - {zone.maxPercent}% of Heart Rate Reserve
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                          {zone.minHR} - {zone.maxHR}
                        </p>
                        <p className="text-sm text-zinc-500">bpm</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                    <h4 className="font-semibold text-green-700 dark:text-green-400">Zone 2 Target</h4>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-300">129 - 141 bpm</p>
                    <p className="text-sm text-green-600 dark:text-green-500">45-60 min, twice weekly</p>
                  </div>
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                    <h4 className="font-semibold text-red-700 dark:text-red-400">HIIT Target (4x4)</h4>
                    <p className="text-2xl font-bold text-red-800 dark:text-red-300">151 - 169 bpm</p>
                    <p className="text-sm text-red-600 dark:text-red-500">85-95% max, 4-min intervals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabContent>

          <TabContent value="nutrition">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-green-500" />
                  Nutrition Targets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      Daily Targets (Training Days)
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                        <span className="text-zinc-700 dark:text-zinc-300">Calories</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">2,400 - 2,600 kcal</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                        <span className="text-zinc-700 dark:text-zinc-300">Protein</span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">160 - 180g (2g/kg)</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                        <span className="text-zinc-700 dark:text-zinc-300">Carbohydrates</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">250 - 300g</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                        <span className="text-zinc-700 dark:text-zinc-300">Fat</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">65 - 80g</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      Daily Targets (Rest Days)
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                        <span className="text-zinc-700 dark:text-zinc-300">Calories</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">2,000 - 2,200 kcal</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                        <span className="text-zinc-700 dark:text-zinc-300">Protein</span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">160 - 180g (2g/kg)</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                        <span className="text-zinc-700 dark:text-zinc-300">Carbohydrates</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">180 - 220g</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                        <span className="text-zinc-700 dark:text-zinc-300">Fat</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">55 - 70g</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">Priority: Protein</h4>
                  <p className="text-sm text-yellow-600 dark:text-yellow-500">
                    Hit protein target every day regardless of total calories. Distribute evenly across 4-5 meals (30-40g per meal).
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabContent>

          <TabContent value="progression">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Progressive Overload Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h3 className="mb-2 font-semibold text-blue-700 dark:text-blue-400">Double Progression Method</h3>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-blue-600 dark:text-blue-500">
                    <li>Start at the low end of rep range (e.g., 6 reps for 6-8 range)</li>
                    <li>Add 1 rep each session until you hit the top of range (8 reps)</li>
                    <li>Increase weight by 2.5kg (upper) or 5kg (lower) and restart at 6 reps</li>
                    <li>If you fail to add a rep for 2 sessions, consider a deload</li>
                  </ol>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                    <h4 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">RIR Guidelines</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">Compound lifts:</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">2 RIR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">Isolation exercises:</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">1 RIR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">Last set (optional):</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">0 RIR</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                    <h4 className="mb-3 font-semibold text-red-700 dark:text-red-400">Deload Protocol</h4>
                    <p className="text-sm text-red-600 dark:text-red-500">
                      Every 4-6 weeks or when: HRV drops &gt;15% for 3+ days, performance plateaus, or RPE consistently &gt;9.
                    </p>
                    <ul className="mt-2 list-inside list-disc text-sm text-red-600 dark:text-red-500">
                      <li>Reduce volume by 40-50%</li>
                      <li>Keep intensity (weight) the same</li>
                      <li>Duration: 1 week</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

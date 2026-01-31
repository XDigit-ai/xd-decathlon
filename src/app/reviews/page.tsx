"use client";

import { AppLayout } from "@/components/layout";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Tabs, TabContent, TabList, TabTrigger, Textarea } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { Calendar, CheckCircle, Clock, Edit, FileText, Plus } from "lucide-react";
import { useState } from "react";

interface Review {
  id: string;
  type: "weekly" | "monthly" | "quarterly";
  periodStart: string;
  periodEnd: string;
  status: "draft" | "completed";
  createdAt: string;
}

const demoReviews: Review[] = [
  { id: "1", type: "weekly", periodStart: "2026-01-20", periodEnd: "2026-01-26", status: "completed", createdAt: "2026-01-26" },
  { id: "2", type: "weekly", periodStart: "2026-01-13", periodEnd: "2026-01-19", status: "completed", createdAt: "2026-01-19" },
  { id: "3", type: "monthly", periodStart: "2026-01-01", periodEnd: "2026-01-31", status: "draft", createdAt: "2026-01-30" },
  { id: "4", type: "weekly", periodStart: "2026-01-06", periodEnd: "2026-01-12", status: "completed", createdAt: "2026-01-12" },
  { id: "5", type: "quarterly", periodStart: "2025-10-01", periodEnd: "2025-12-31", status: "completed", createdAt: "2026-01-02" },
];

// Demo auto-populated data for weekly review
const weeklyAutoData = {
  startWeight: 83.5,
  endWeight: 83.2,
  avgWeight: 83.4,
  sessionsCompleted: 5,
  sessionsPlanned: 6,
  totalVolume: 28710,
  avgHrv: 64,
  avgSleep: 420,
  avgRecovery: 72,
  cardioMinutes: 97,
};

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState("weekly");
  const [isCreating, setIsCreating] = useState(false);

  // Weekly review form state
  const [weeklyForm, setWeeklyForm] = useState({
    overallRpe: 7,
    nutritionCompliance: 80,
    proteinTarget: true,
    wins: "",
    challenges: "",
    focusNextWeek: "",
    notes: "",
  });

  const handleCreateReview = (type: "weekly" | "monthly" | "quarterly") => {
    setIsCreating(true);
    setActiveTab(type);
  };

  const filteredReviews = demoReviews.filter(r => r.type === activeTab);

  return (
    <AppLayout title="Reviews" subtitle="Weekly, monthly, and quarterly assessments">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => handleCreateReview("weekly")}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Weekly Review</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Due Sunday</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => handleCreateReview("monthly")}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                <FileText className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Monthly Review</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">First weekend of month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => handleCreateReview("quarterly")}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Quarterly Review</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Deep assessment</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="weekly">
          <TabList>
            <TabTrigger value="weekly">Weekly</TabTrigger>
            <TabTrigger value="monthly">Monthly</TabTrigger>
            <TabTrigger value="quarterly">Quarterly</TabTrigger>
          </TabList>

          <TabContent value="weekly">
            {isCreating && activeTab === "weekly" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Review - Jan 27 - Feb 2, 2026</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Auto-populated Data */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                      <p className="text-xs text-zinc-500">Weight Change</p>
                      <p className="text-lg font-bold text-green-600">
                        {(weeklyAutoData.endWeight - weeklyAutoData.startWeight).toFixed(1)} kg
                      </p>
                      <p className="text-xs text-zinc-400">{weeklyAutoData.startWeight} → {weeklyAutoData.endWeight}</p>
                    </div>
                    <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                      <p className="text-xs text-zinc-500">Training</p>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {weeklyAutoData.sessionsCompleted}/{weeklyAutoData.sessionsPlanned}
                      </p>
                      <p className="text-xs text-zinc-400">sessions completed</p>
                    </div>
                    <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                      <p className="text-xs text-zinc-500">Total Volume</p>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {weeklyAutoData.totalVolume.toLocaleString()} kg
                      </p>
                    </div>
                    <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                      <p className="text-xs text-zinc-500">Avg Recovery</p>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {weeklyAutoData.avgRecovery}%
                      </p>
                      <p className="text-xs text-zinc-400">HRV: {weeklyAutoData.avgHrv} ms</p>
                    </div>
                  </div>

                  {/* Manual Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Overall RPE (1-10)</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={weeklyForm.overallRpe}
                        onChange={(e) => setWeeklyForm({ ...weeklyForm, overallRpe: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>Easy</span>
                        <span>{weeklyForm.overallRpe}</span>
                        <span>Hard</span>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Nutrition Compliance (%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={weeklyForm.nutritionCompliance}
                        onChange={(e) => setWeeklyForm({ ...weeklyForm, nutritionCompliance: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>0%</span>
                        <span>{weeklyForm.nutritionCompliance}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  <Textarea
                    label="Wins this week"
                    placeholder="What went well?"
                    value={weeklyForm.wins}
                    onChange={(e) => setWeeklyForm({ ...weeklyForm, wins: e.target.value })}
                    rows={2}
                  />

                  <Textarea
                    label="Challenges"
                    placeholder="What was difficult?"
                    value={weeklyForm.challenges}
                    onChange={(e) => setWeeklyForm({ ...weeklyForm, challenges: e.target.value })}
                    rows={2}
                  />

                  <Textarea
                    label="Focus for next week"
                    placeholder="What will you prioritize?"
                    value={weeklyForm.focusNextWeek}
                    onChange={(e) => setWeeklyForm({ ...weeklyForm, focusNextWeek: e.target.value })}
                    rows={2}
                  />

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setIsCreating(false)}>
                      Save Draft
                    </Button>
                    <Button className="flex-1">
                      Complete Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Weekly Reviews</span>
                    <Button size="sm" onClick={() => handleCreateReview("weekly")}>
                      <Plus className="mr-1 h-4 w-4" />
                      New Review
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredReviews.map((review) => (
                      <div
                        key={review.id}
                        className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                            <Calendar className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                              {formatDate(review.periodStart)} - {formatDate(review.periodEnd)}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              Created {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={review.status === "completed" ? "success" : "warning"}>
                            {review.status === "completed" ? "Completed" : "Draft"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabContent>

          <TabContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoReviews.filter(r => r.type === "monthly").map((review) => (
                    <div
                      key={review.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                          <FileText className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">
                            January 2026
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Monthly assessment
                          </p>
                        </div>
                      </div>
                      <Badge variant={review.status === "completed" ? "success" : "warning"}>
                        {review.status === "completed" ? "Completed" : "Draft"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabContent>

          <TabContent value="quarterly">
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoReviews.filter(r => r.type === "quarterly").map((review) => (
                    <div
                      key={review.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">
                            Q4 2025
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            DEXA, Cooper test, FMS, Photos
                          </p>
                        </div>
                      </div>
                      <Badge variant="success">Completed</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

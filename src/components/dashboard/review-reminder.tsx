"use client";

import { Card, CardContent } from "@/components/ui";
import { daysUntilNextReview } from "@/lib/utils";
import { Calendar } from "lucide-react";
import Link from "next/link";

export function ReviewReminder() {
  const daysToWeekly = daysUntilNextReview("weekly");
  const daysToMonthly = daysUntilNextReview("monthly");

  let reminderType: "weekly" | "monthly" = "weekly";
  let daysLeft = daysToWeekly;

  // Show monthly reminder if it's sooner or if weekly is today
  if (daysToWeekly === 0) {
    reminderType = "weekly";
    daysLeft = 0;
  } else if (daysToMonthly < daysToWeekly) {
    reminderType = "monthly";
    daysLeft = daysToMonthly;
  }

  const reminderText =
    daysLeft === 0
      ? `${reminderType === "weekly" ? "Weekly" : "Monthly"} review due today!`
      : daysLeft === 1
      ? `${reminderType === "weekly" ? "Weekly" : "Monthly"} review due tomorrow`
      : `${reminderType === "weekly" ? "Weekly" : "Monthly"} review in ${daysLeft} days`;

  return (
    <Link href="/reviews">
      <Card className="border-blue-200 bg-blue-50 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:hover:bg-blue-900/30">
        <CardContent className="flex items-center gap-3 py-3">
          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-800">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {reminderText}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

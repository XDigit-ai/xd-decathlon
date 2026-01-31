"use client";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface PersonalRecord {
  id: string;
  exerciseName: string;
  value: number;
  unit: string;
  recordType: "1rm" | "volume" | "reps";
  achievedAt: string;
}

interface PRListProps {
  records: PersonalRecord[];
}

export function PRList({ records }: PRListProps) {
  const recordTypeLabels = {
    "1rm": "E1RM",
    volume: "Volume",
    reps: "Reps",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Personal Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-800">
                  <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {record.exerciseName}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(record.achievedAt)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {record.value} {record.unit}
                </p>
                <Badge variant="warning" size="sm">
                  {recordTypeLabels[record.recordType]}
                </Badge>
              </div>
            </div>
          ))}

          {records.length === 0 && (
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              No PRs recorded yet. Keep training!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

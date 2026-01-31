import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Calendar, TrendingUp } from 'lucide-react';
import { formatDate, formatRelative } from '@/lib/utils/date';
import { formatWeight } from '@/lib/utils/format';

interface Workout {
  id: string;
  title: string;
  started_at: string;
  total_volume_kg: number;
  total_sets: number;
}

interface RecentWorkoutsProps {
  workouts: Workout[];
}

export function RecentWorkouts({ workouts }: RecentWorkoutsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent Workouts</CardTitle>
        <Dumbbell className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {workouts.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900">No workouts yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Connect Hevy to sync your workouts automatically
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="flex items-start justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {workout.title}
                    </h4>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatRelative(workout.started_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{workout.total_sets} sets</span>
                    </div>
                  </div>
                </div>
                <div className="ml-3 text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatWeight(workout.total_volume_kg, 'kg')}
                  </div>
                  <div className="text-xs text-gray-500">volume</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

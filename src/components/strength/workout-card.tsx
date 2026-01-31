/**
 * Workout Card Component
 * Displays summary information for a single workout
 */

import Link from 'next/link';
import { Calendar, Clock, TrendingUp, Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

export interface WorkoutCardProps {
  id: string;
  title: string;
  date: string;
  duration: number | null; // in seconds
  totalVolume: number; // in kg
  totalSets: number;
  exerciseCount: number;
  className?: string;
}

/**
 * Format duration in seconds to human-readable format
 */
function formatDuration(seconds: number | null): string {
  if (!seconds) return 'N/A';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

/**
 * Format date to human-readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format volume in kg to human-readable format
 */
function formatVolume(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}t`;
  }
  return `${Math.round(kg)} kg`;
}

export function WorkoutCard({
  id,
  title,
  date,
  duration,
  totalVolume,
  totalSets,
  exerciseCount,
  className,
}: WorkoutCardProps) {
  return (
    <Link href={`/strength/workout/${id}`}>
      <Card
        className={cn(
          'transition-all hover:shadow-md hover:border-primary/50 cursor-pointer',
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(date)}</span>
              </div>
            </div>
            <Badge variant="secondary" className="ml-2">
              {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4">
            {/* Duration */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{formatDuration(duration)}</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
            </div>

            {/* Total Volume */}
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{formatVolume(totalVolume)}</div>
                <div className="text-xs text-muted-foreground">Volume</div>
              </div>
            </div>

            {/* Total Sets */}
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{totalSets}</div>
                <div className="text-xs text-muted-foreground">Sets</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

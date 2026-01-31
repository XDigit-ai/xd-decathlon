/**
 * Personal Records Feed Component
 * Displays a list of recent personal records with badges and formatting
 */

import { Trophy, TrendingUp, Dumbbell, Target, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

export interface PersonalRecord {
  id: string;
  exercise_title: string;
  record_type: 'one_rm' | 'max_weight' | 'max_volume' | 'max_reps';
  value: number;
  previous_value: number | null;
  date: string;
}

export interface PRFeedProps {
  records: PersonalRecord[];
  className?: string;
}

/**
 * Get icon for record type
 */
function getRecordIcon(recordType: string) {
  switch (recordType) {
    case 'one_rm':
      return Trophy;
    case 'max_weight':
      return Dumbbell;
    case 'max_volume':
      return TrendingUp;
    case 'max_reps':
      return Zap;
    default:
      return Target;
  }
}

/**
 * Get label for record type
 */
function getRecordLabel(recordType: string): string {
  switch (recordType) {
    case 'one_rm':
      return 'Estimated 1RM';
    case 'max_weight':
      return 'Max Weight';
    case 'max_volume':
      return 'Max Volume';
    case 'max_reps':
      return 'Max Reps';
    default:
      return 'Record';
  }
}

/**
 * Format record value based on type
 */
function formatValue(value: number, recordType: string): string {
  switch (recordType) {
    case 'one_rm':
    case 'max_weight':
      return `${value.toFixed(1)} kg`;
    case 'max_volume':
      return `${Math.round(value)} kg`;
    case 'max_reps':
      return `${Math.round(value)} reps`;
    default:
      return value.toString();
  }
}

/**
 * Calculate improvement percentage
 */
function calculateImprovement(current: number, previous: number | null): number | null {
  if (!previous || previous === 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

/**
 * Format date to relative time
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
    return `${diffDays}d ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}w ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export function PRFeed({ records, className }: PRFeedProps) {
  if (records.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">
          No personal records yet. Keep training!
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {records.map((record) => {
        const Icon = getRecordIcon(record.record_type);
        const improvement = calculateImprovement(record.value, record.previous_value);

        return (
          <Card key={record.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {record.exercise_title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getRecordLabel(record.record_type)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0">
                      {formatDate(record.date)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-primary">
                      {formatValue(record.value, record.record_type)}
                    </span>

                    {improvement !== null && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700 border-green-200"
                      >
                        +{improvement.toFixed(1)}%
                      </Badge>
                    )}

                    {record.previous_value !== null && (
                      <span className="text-xs text-muted-foreground">
                        from {formatValue(record.previous_value, record.record_type)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

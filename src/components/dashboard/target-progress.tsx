import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

interface TargetProgressProps {
  progress: number;
}

export function TargetProgress({ progress }: TargetProgressProps) {
  return (
    <Card className="group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-bold">Target Progress</CardTitle>
        <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
          <Target className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-muted-foreground">Overall completion</span>
            <span className="text-4xl font-bold tracking-tight">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {progress === 0
              ? 'Set targets to begin tracking progress'
              : `${progress}% of active targets on track`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

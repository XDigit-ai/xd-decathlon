'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, Calendar, ArrowRight } from 'lucide-react';
import type { TargetWithProgress } from '@/types/targets';

interface TargetCardProps {
  target: TargetWithProgress;
  onUpdate: () => void;
}

export function TargetCard({ target, onUpdate }: TargetCardProps) {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(
    target.current_value?.toString() || ''
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const getProgressColor = (progress: number, onTrack: boolean) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50 || onTrack) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (progress: number, onTrack: boolean) => {
    if (progress >= 100) {
      return (
        <Badge variant="default" className="bg-green-600">
          Achieved
        </Badge>
      );
    }
    if (onTrack) {
      return (
        <Badge variant="default" className="bg-green-600">
          On Track
        </Badge>
      );
    }
    if (progress >= 50) {
      return (
        <Badge variant="default" className="bg-yellow-600">
          Moderate Progress
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-red-600">
        Needs Attention
      </Badge>
    );
  };

  const handleUpdateProgress = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/targets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: target.id,
          current_value: parseFloat(currentValue),
        }),
      });

      if (response.ok) {
        setIsUpdateDialogOpen(false);
        onUpdate();
      } else {
        console.error('Failed to update target');
      }
    } catch (error) {
      console.error('Error updating target:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatValue = (value: number | null) => {
    if (value === null) return '-';
    return value.toFixed(2);
  };

  const currentVal = target.current_value ?? target.baseline ?? 0;
  const isImproving = target.metric_info.increase_is_better
    ? currentVal > (target.baseline ?? 0)
    : currentVal < (target.baseline ?? 0);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{target.metric_info.name}</CardTitle>
              <CardDescription className="capitalize mt-1">
                {target.metric_info.category}
              </CardDescription>
            </div>
            {getStatusBadge(target.progress_percentage, target.on_track_12m)}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Current:</span>
              <span className="font-semibold flex items-center gap-1">
                {formatValue(currentVal)} {target.unit}
                {isImproving ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Baseline:</span>
              <span className="font-medium">
                {formatValue(target.baseline)} {target.unit}
              </span>
            </div>
          </div>

          <Tabs defaultValue="3m" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="3m">3M</TabsTrigger>
              <TabsTrigger value="6m">6M</TabsTrigger>
              <TabsTrigger value="12m">12M</TabsTrigger>
            </TabsList>

            <TabsContent value="3m" className="space-y-3">
              {target.target_3m ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Target:</span>
                    <span className="text-sm font-semibold">
                      {formatValue(target.target_3m)} {target.unit}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      100,
                      ((currentVal - (target.baseline ?? 0)) /
                        ((target.target_3m ?? 0) - (target.baseline ?? 0))) *
                        100
                    )}
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {target.days_remaining_3m} days remaining
                    </span>
                    <span className="font-medium">
                      {Math.round(
                        ((currentVal - (target.baseline ?? 0)) /
                          ((target.target_3m ?? 0) - (target.baseline ?? 0))) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No 3-month target set</p>
              )}
            </TabsContent>

            <TabsContent value="6m" className="space-y-3">
              {target.target_6m ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Target:</span>
                    <span className="text-sm font-semibold">
                      {formatValue(target.target_6m)} {target.unit}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      100,
                      ((currentVal - (target.baseline ?? 0)) /
                        ((target.target_6m ?? 0) - (target.baseline ?? 0))) *
                        100
                    )}
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {target.days_remaining_6m} days remaining
                    </span>
                    <span className="font-medium">
                      {Math.round(
                        ((currentVal - (target.baseline ?? 0)) /
                          ((target.target_6m ?? 0) - (target.baseline ?? 0))) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No 6-month target set</p>
              )}
            </TabsContent>

            <TabsContent value="12m" className="space-y-3">
              {target.target_12m ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Target:</span>
                    <span className="text-sm font-semibold">
                      {formatValue(target.target_12m)} {target.unit}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      100,
                      ((currentVal - (target.baseline ?? 0)) /
                        ((target.target_12m ?? 0) - (target.baseline ?? 0))) *
                        100
                    )}
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {target.days_remaining_12m} days remaining
                    </span>
                    <span className="font-medium">
                      {Math.round(
                        ((currentVal - (target.baseline ?? 0)) /
                          ((target.target_12m ?? 0) - (target.baseline ?? 0))) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No 12-month target set
                </p>
              )}
            </TabsContent>
          </Tabs>

          {target.notes && (
            <p className="text-xs text-muted-foreground italic">{target.notes}</p>
          )}
        </CardContent>

        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsUpdateDialogOpen(true)}
          >
            Update Progress
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
            <DialogDescription>
              Update your current value for {target.metric_info.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-value">
                Current Value ({target.unit})
              </Label>
              <Input
                id="current-value"
                type="number"
                step="0.01"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder={`Enter value in ${target.unit}`}
              />
            </div>

            <div className="rounded-lg bg-muted p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Baseline:</span>
                <span className="font-medium">
                  {formatValue(target.baseline)} {target.unit}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">12M Target:</span>
                <span className="font-medium">
                  {formatValue(target.target_12m)} {target.unit}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateProgress} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TestItem {
  testType: string;
  label: string;
  unit: string;
  lastValue: number | null;
  lastDate: string | null;
  completedThisWeek: boolean;
}

const DELOAD_TESTS: { testType: string; label: string; unit: string }[] = [
  { testType: 'pull_ups', label: 'Pull-ups (max strict)', unit: 'reps' },
  { testType: 'dead_hang', label: 'Dead Hang (max)', unit: 'seconds' },
  { testType: 'plank', label: 'Plank (max)', unit: 'seconds' },
  { testType: 'farmer_walk', label: 'Farmer Carry', unit: 'seconds' },
];

export function TestingWeekBanner() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEntry, setActiveEntry] = useState<string | null>(null);
  const [entryValue, setEntryValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  async function fetchTests() {
    try {
      const res = await fetch('/api/metrics/functional');
      if (!res.ok) return;
      const data = await res.json();

      // Get the start of current week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);
      const weekStart = monday.toISOString().split('T')[0];

      const testItems: TestItem[] = DELOAD_TESTS.map(({ testType, label, unit }) => {
        const group = data.data?.grouped?.[testType];
        const latest = group?.latest;
        const completedThisWeek = group?.all?.some(
          (t: { date: string }) => t.date >= weekStart
        ) ?? false;

        return {
          testType,
          label,
          unit,
          lastValue: latest?.value ?? null,
          lastDate: latest?.date ?? null,
          completedThisWeek,
        };
      });

      setTests(testItems);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(testType: string) {
    if (!entryValue) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/metrics/functional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_type: testType,
          value: parseFloat(entryValue),
        }),
      });
      if (res.ok) {
        setActiveEntry(null);
        setEntryValue('');
        fetchTests();
      }
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  }

  const completedCount = tests.filter(t => t.completedThisWeek).length;

  if (loading) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-base">Deload & Testing Week</CardTitle>
          </div>
          <Badge variant="outline" className="text-amber-700 border-amber-300">
            {completedCount}/{DELOAD_TESTS.length} tests done
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          ~40% less load, ~35% fewer sets. Complete these tests when fresh:
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {tests.map((test) => (
          <div key={test.testType} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              {test.completedThisWeek ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">{test.label}</p>
                <p className="text-xs text-muted-foreground">
                  {test.lastValue !== null
                    ? `Last: ${test.lastValue} ${test.unit}${test.lastDate ? ` (${test.lastDate})` : ''}`
                    : 'No previous record'}
                </p>
              </div>
            </div>
            {activeEntry === test.testType ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={entryValue}
                  onChange={(e) => setEntryValue(e.target.value)}
                  placeholder={test.unit}
                  className="w-24 h-8 text-sm"
                  disabled={submitting}
                />
                <Button size="sm" onClick={() => handleSubmit(test.testType)} disabled={submitting || !entryValue}>
                  {submitting ? '...' : 'Save'}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setActiveEntry(test.testType); setEntryValue(''); }}
                disabled={test.completedThisWeek}
              >
                {test.completedThisWeek ? 'Done' : 'Record'}
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

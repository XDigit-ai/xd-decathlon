'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/date';
import { formatWeight, formatPercentage } from '@/lib/utils/format';
import { Trash2 } from 'lucide-react';

interface WeightEntry {
  id: string;
  date: string;
  weight_kg: number;
  body_fat_pct: number | null;
  notes: string | null;
  source: string;
}

interface WeightHistoryProps {
  entries: WeightEntry[];
}

export function WeightHistory({ entries }: WeightHistoryProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/metrics/body?type=weight&id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      router.refresh();
    } catch (err) {
      alert('Failed to delete entry. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight History</CardTitle>
          <CardDescription>Your recent weight entries</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No weight entries yet. Log your first weight above!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight History</CardTitle>
        <CardDescription>Your recent weight entries</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 font-medium">Date</th>
                <th className="text-left py-2 px-4 font-medium">Weight</th>
                <th className="text-left py-2 px-4 font-medium">Body Fat</th>
                <th className="text-left py-2 px-4 font-medium">Notes</th>
                <th className="text-left py-2 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 text-sm">
                    {formatDate(entry.date, 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">
                    {formatWeight(entry.weight_kg, 'kg')}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {entry.body_fat_pct ? formatPercentage(entry.body_fat_pct) : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                    {entry.notes || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

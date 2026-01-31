'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/date';

export function MeasurementsForm() {
  const router = useRouter();
  const today = formatDate(new Date(), 'yyyy-MM-dd');

  const [date, setDate] = useState(today);
  const [measurements, setMeasurements] = useState({
    chest_cm: '',
    waist_cm: '',
    hips_cm: '',
    left_arm_cm: '',
    right_arm_cm: '',
    left_thigh_cm: '',
    right_thigh_cm: '',
    left_calf_cm: '',
    right_calf_cm: '',
    neck_cm: '',
    shoulders_cm: '',
  });
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: any = {
        type: 'measurements',
        date,
      };

      Object.entries(measurements).forEach(([key, value]) => {
        if (value) {
          payload[key] = parseFloat(value);
        }
      });

      if (notes) {
        payload.notes = notes;
      }

      const response = await fetch('/api/metrics/body', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save measurements');
      }

      setSuccess(true);
      setMeasurements({
        chest_cm: '',
        waist_cm: '',
        hips_cm: '',
        left_arm_cm: '',
        right_arm_cm: '',
        left_thigh_cm: '',
        right_thigh_cm: '',
        left_calf_cm: '',
        right_calf_cm: '',
        neck_cm: '',
        shoulders_cm: '',
      });
      setNotes('');
      setDate(today);

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save measurements');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Body Measurements</CardTitle>
        <CardDescription>Track your body measurements in centimeters</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="measurement-date">Date</Label>
            <Input
              id="measurement-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
              required
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Upper Body</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chest">Chest (cm)</Label>
                <Input
                  id="chest"
                  type="number"
                  step="0.1"
                  min="0"
                  value={measurements.chest_cm}
                  onChange={(e) => handleMeasurementChange('chest_cm', e.target.value)}
                  placeholder="e.g., 100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waist">Waist (cm)</Label>
                <Input
                  id="waist"
                  type="number"
                  step="0.1"
                  min="0"
                  value={measurements.waist_cm}
                  onChange={(e) => handleMeasurementChange('waist_cm', e.target.value)}
                  placeholder="e.g., 85"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shoulders">Shoulders (cm)</Label>
                <Input
                  id="shoulders"
                  type="number"
                  step="0.1"
                  min="0"
                  value={measurements.shoulders_cm}
                  onChange={(e) => handleMeasurementChange('shoulders_cm', e.target.value)}
                  placeholder="e.g., 120"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neck">Neck (cm)</Label>
                <Input
                  id="neck"
                  type="number"
                  step="0.1"
                  min="0"
                  value={measurements.neck_cm}
                  onChange={(e) => handleMeasurementChange('neck_cm', e.target.value)}
                  placeholder="e.g., 38"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Arms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="left-arm">Left Arm (cm)</Label>
                <Input
                  id="left-arm"
                  type="number"
                  step="0.1"
                  min="0"
                  value={measurements.left_arm_cm}
                  onChange={(e) => handleMeasurementChange('left_arm_cm', e.target.value)}
                  placeholder="e.g., 35"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="right-arm">Right Arm (cm)</Label>
                <Input
                  id="right-arm"
                  type="number"
                  step="0.1"
                  min="0"
                  value={measurements.right_arm_cm}
                  onChange={(e) => handleMeasurementChange('right_arm_cm', e.target.value)}
                  placeholder="e.g., 35"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Lower Body</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hips">Hips (cm)</Label>
                <Input
                  id="hips"
                  type="number"
                  step="0.1"
                  min="0"
                  value={measurements.hips_cm}
                  onChange={(e) => handleMeasurementChange('hips_cm', e.target.value)}
                  placeholder="e.g., 95"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="left-thigh">Left Thigh (cm)</Label>
                <Input
                  id="left-thigh"
                  type="number"
                  step="0.1"
                  min="0"
                  value={measurements.left_thigh_cm}
                  onChange={(e) => handleMeasurementChange('left_thigh_cm', e.target.value)}
                  placeholder="e.g., 55"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="right-thigh">Right Thigh (cm)</Label>
                <Input
                  id="right-thigh"
                  type="number"
                  step="0.1"
                  min="0"
                  value={measurements.right_thigh_cm}
                  onChange={(e) => handleMeasurementChange('right_thigh_cm', e.target.value)}
                  placeholder="e.g., 55"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="left-calf">Left Calf (cm)</Label>
                <Input
                  id="left-calf"
                  type="number"
                  step="0.1"
                  min="0"
                  value={measurements.left_calf_cm}
                  onChange={(e) => handleMeasurementChange('left_calf_cm', e.target.value)}
                  placeholder="e.g., 38"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="right-calf">Right Calf (cm)</Label>
                <Input
                  id="right-calf"
                  type="number"
                  step="0.1"
                  min="0"
                  value={measurements.right_calf_cm}
                  onChange={(e) => handleMeasurementChange('right_calf_cm', e.target.value)}
                  placeholder="e.g., 38"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="measurement-notes">Notes (optional)</Label>
            <Input
              id="measurement-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
              Measurements logged successfully!
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : 'Log Measurements'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

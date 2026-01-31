'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/date';

export function DexaForm() {
  const router = useRouter();
  const today = formatDate(new Date(), 'yyyy-MM-dd');

  const [date, setDate] = useState(today);
  const [data, setData] = useState({
    total_body_fat_pct: '',
    lean_mass_kg: '',
    fat_mass_kg: '',
    bone_mineral_density: '',
    visceral_fat_area_cm2: '',
    android_fat_pct: '',
    gynoid_fat_pct: '',
    appendicular_lean_mass_kg: '',
    scan_provider: '',
  });
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDataChange = (field: string, value: string) => {
    setData((prev) => ({
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
      if (!data.total_body_fat_pct) {
        throw new Error('Total body fat percentage is required');
      }

      const payload: any = {
        type: 'dexa',
        date,
        total_body_fat_pct: parseFloat(data.total_body_fat_pct),
      };

      if (data.lean_mass_kg) payload.lean_mass_kg = parseFloat(data.lean_mass_kg);
      if (data.fat_mass_kg) payload.fat_mass_kg = parseFloat(data.fat_mass_kg);
      if (data.bone_mineral_density) payload.bone_mineral_density = parseFloat(data.bone_mineral_density);
      if (data.visceral_fat_area_cm2) payload.visceral_fat_area_cm2 = parseFloat(data.visceral_fat_area_cm2);
      if (data.android_fat_pct) payload.android_fat_pct = parseFloat(data.android_fat_pct);
      if (data.gynoid_fat_pct) payload.gynoid_fat_pct = parseFloat(data.gynoid_fat_pct);
      if (data.appendicular_lean_mass_kg) payload.appendicular_lean_mass_kg = parseFloat(data.appendicular_lean_mass_kg);
      if (data.scan_provider) payload.scan_provider = data.scan_provider;
      if (notes) payload.notes = notes;

      const response = await fetch('/api/metrics/body', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save DEXA scan');
      }

      setSuccess(true);
      setData({
        total_body_fat_pct: '',
        lean_mass_kg: '',
        fat_mass_kg: '',
        bone_mineral_density: '',
        visceral_fat_area_cm2: '',
        android_fat_pct: '',
        gynoid_fat_pct: '',
        appendicular_lean_mass_kg: '',
        scan_provider: '',
      });
      setNotes('');
      setDate(today);

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save DEXA scan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log DEXA Scan</CardTitle>
        <CardDescription>Record DEXA scan results for detailed body composition tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dexa-date">Date</Label>
              <Input
                id="dexa-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={today}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Scan Provider (optional)</Label>
              <Input
                id="provider"
                type="text"
                value={data.scan_provider}
                onChange={(e) => handleDataChange('scan_provider', e.target.value)}
                placeholder="e.g., BodySpec, DexaFit"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Body Composition</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total-bf">Total Body Fat %</Label>
                <Input
                  id="total-bf"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={data.total_body_fat_pct}
                  onChange={(e) => handleDataChange('total_body_fat_pct', e.target.value)}
                  placeholder="e.g., 18.5"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lean-mass">Lean Mass (kg)</Label>
                <Input
                  id="lean-mass"
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.lean_mass_kg}
                  onChange={(e) => handleDataChange('lean_mass_kg', e.target.value)}
                  placeholder="e.g., 62.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fat-mass">Fat Mass (kg)</Label>
                <Input
                  id="fat-mass"
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.fat_mass_kg}
                  onChange={(e) => handleDataChange('fat_mass_kg', e.target.value)}
                  placeholder="e.g., 12.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bmd">Bone Mineral Density</Label>
                <Input
                  id="bmd"
                  type="number"
                  step="0.001"
                  min="0"
                  value={data.bone_mineral_density}
                  onChange={(e) => handleDataChange('bone_mineral_density', e.target.value)}
                  placeholder="e.g., 1.125"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appendicular">Appendicular Lean Mass (kg)</Label>
                <Input
                  id="appendicular"
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.appendicular_lean_mass_kg}
                  onChange={(e) => handleDataChange('appendicular_lean_mass_kg', e.target.value)}
                  placeholder="e.g., 28.5"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Regional Fat Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visceral">Visceral Fat Area (cm²)</Label>
                <Input
                  id="visceral"
                  type="number"
                  step="0.1"
                  min="0"
                  value={data.visceral_fat_area_cm2}
                  onChange={(e) => handleDataChange('visceral_fat_area_cm2', e.target.value)}
                  placeholder="e.g., 45.2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="android">Android Fat %</Label>
                <Input
                  id="android"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={data.android_fat_pct}
                  onChange={(e) => handleDataChange('android_fat_pct', e.target.value)}
                  placeholder="e.g., 22.3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gynoid">Gynoid Fat %</Label>
                <Input
                  id="gynoid"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={data.gynoid_fat_pct}
                  onChange={(e) => handleDataChange('gynoid_fat_pct', e.target.value)}
                  placeholder="e.g., 18.7"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dexa-notes">Notes (optional)</Label>
            <Input
              id="dexa-notes"
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
              DEXA scan logged successfully!
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : 'Log DEXA Scan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

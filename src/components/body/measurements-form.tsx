"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui";
import { Ruler } from "lucide-react";
import { useState } from "react";

interface MeasurementsFormProps {
  onSubmit: (measurements: MeasurementData) => void;
  initialData?: MeasurementData;
}

export interface MeasurementData {
  waist: number | null;
  hips: number | null;
  chest: number | null;
  leftArm: number | null;
  rightArm: number | null;
  leftThigh: number | null;
  rightThigh: number | null;
  notes: string;
}

export function MeasurementsForm({ onSubmit, initialData }: MeasurementsFormProps) {
  const [measurements, setMeasurements] = useState<MeasurementData>(
    initialData || {
      waist: null,
      hips: null,
      chest: null,
      leftArm: null,
      rightArm: null,
      leftThigh: null,
      rightThigh: null,
      notes: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(measurements);
  };

  const updateMeasurement = (key: keyof MeasurementData, value: string) => {
    if (key === "notes") {
      setMeasurements({ ...measurements, notes: value });
    } else {
      const numValue = value === "" ? null : parseFloat(value);
      setMeasurements({ ...measurements, [key]: numValue });
    }
  };

  const waistToHipRatio = measurements.waist && measurements.hips
    ? (measurements.waist / measurements.hips).toFixed(2)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5 text-blue-500" />
          Body Measurements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Waist (cm)"
              type="number"
              step="0.1"
              placeholder="e.g., 86.5"
              value={measurements.waist ?? ""}
              onChange={(e) => updateMeasurement("waist", e.target.value)}
            />
            <Input
              label="Hips (cm)"
              type="number"
              step="0.1"
              placeholder="e.g., 98.0"
              value={measurements.hips ?? ""}
              onChange={(e) => updateMeasurement("hips", e.target.value)}
            />
          </div>

          {waistToHipRatio && (
            <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Waist-to-Hip Ratio:{" "}
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {waistToHipRatio}
              </span>
              <span className="ml-2 text-xs text-zinc-500">
                (healthy: &lt;0.90 for men)
              </span>
            </div>
          )}

          <Input
            label="Chest (cm)"
            type="number"
            step="0.1"
            placeholder="e.g., 102.0"
            value={measurements.chest ?? ""}
            onChange={(e) => updateMeasurement("chest", e.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Left Arm (cm)"
              type="number"
              step="0.1"
              placeholder="e.g., 35.5"
              value={measurements.leftArm ?? ""}
              onChange={(e) => updateMeasurement("leftArm", e.target.value)}
            />
            <Input
              label="Right Arm (cm)"
              type="number"
              step="0.1"
              placeholder="e.g., 36.0"
              value={measurements.rightArm ?? ""}
              onChange={(e) => updateMeasurement("rightArm", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Left Thigh (cm)"
              type="number"
              step="0.1"
              placeholder="e.g., 58.0"
              value={measurements.leftThigh ?? ""}
              onChange={(e) => updateMeasurement("leftThigh", e.target.value)}
            />
            <Input
              label="Right Thigh (cm)"
              type="number"
              step="0.1"
              placeholder="e.g., 58.5"
              value={measurements.rightThigh ?? ""}
              onChange={(e) => updateMeasurement("rightThigh", e.target.value)}
            />
          </div>

          <Input
            label="Notes"
            placeholder="Any observations..."
            value={measurements.notes}
            onChange={(e) => updateMeasurement("notes", e.target.value)}
          />

          <Button type="submit" className="w-full">
            Save Measurements
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

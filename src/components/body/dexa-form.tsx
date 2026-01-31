"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from "@/components/ui";
import { FileText } from "lucide-react";
import { useState } from "react";

interface DexaFormProps {
  onSubmit: (data: DexaData) => void;
}

export interface DexaData {
  date: string;
  bodyFatPercent: number;
  fatMassKg: number;
  leanMassKg: number;
  boneDensity: number | null;
  visceralFatArea: number | null;
  notes: string;
}

export function DexaForm({ onSubmit }: DexaFormProps) {
  const [data, setData] = useState<DexaData>({
    date: new Date().toISOString().split("T")[0],
    bodyFatPercent: 0,
    fatMassKg: 0,
    leanMassKg: 0,
    boneDensity: null,
    visceralFatArea: null,
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-500" />
          DEXA Scan Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Scan Date"
            type="date"
            value={data.date}
            onChange={(e) => setData({ ...data, date: e.target.value })}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Body Fat %"
              type="number"
              step="0.1"
              placeholder="e.g., 22.5"
              value={data.bodyFatPercent || ""}
              onChange={(e) =>
                setData({ ...data, bodyFatPercent: parseFloat(e.target.value) || 0 })
              }
            />
            <Input
              label="Fat Mass (kg)"
              type="number"
              step="0.1"
              placeholder="e.g., 18.5"
              value={data.fatMassKg || ""}
              onChange={(e) =>
                setData({ ...data, fatMassKg: parseFloat(e.target.value) || 0 })
              }
            />
            <Input
              label="Lean Mass (kg)"
              type="number"
              step="0.1"
              placeholder="e.g., 62.5"
              value={data.leanMassKg || ""}
              onChange={(e) =>
                setData({ ...data, leanMassKg: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Bone Density (g/cm²)"
              type="number"
              step="0.001"
              placeholder="e.g., 1.250"
              value={data.boneDensity ?? ""}
              onChange={(e) =>
                setData({
                  ...data,
                  boneDensity: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
            />
            <Input
              label="Visceral Fat Area (cm²)"
              type="number"
              step="0.1"
              placeholder="e.g., 85.0"
              value={data.visceralFatArea ?? ""}
              onChange={(e) =>
                setData({
                  ...data,
                  visceralFatArea: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
            />
          </div>

          <Textarea
            label="Notes"
            placeholder="Any observations from the scan..."
            value={data.notes}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            rows={3}
          />

          <Button type="submit" className="w-full">
            Save DEXA Results
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

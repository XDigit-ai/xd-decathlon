"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui";
import { Scale } from "lucide-react";
import { useState } from "react";

interface WeightEntryFormProps {
  onSubmit: (weight: number, date: string, notes?: string) => void;
  latestWeight?: number;
}

export function WeightEntryForm({ onSubmit, latestWeight }: WeightEntryFormProps) {
  const [weight, setWeight] = useState(latestWeight?.toString() || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!isNaN(w) && w > 0) {
      onSubmit(w, date, notes || undefined);
      setNotes("");
    }
  };

  const change = latestWeight && weight
    ? (parseFloat(weight) - latestWeight).toFixed(1)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-purple-500" />
          Log Weight
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div>
            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              placeholder="e.g., 83.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            {change && (
              <p className={`mt-1 text-sm ${parseFloat(change) <= 0 ? "text-green-500" : "text-yellow-500"}`}>
                {parseFloat(change) > 0 ? "+" : ""}{change} kg from last entry
              </p>
            )}
          </div>

          <Input
            label="Notes (optional)"
            placeholder="e.g., after morning workout"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button type="submit" className="w-full">
            Save Weight
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

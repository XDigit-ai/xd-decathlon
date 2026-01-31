"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface TestFormProps {
  onSuccess?: () => void;
}

const TEST_OPTIONS = [
  { value: "dead_hang", label: "Dead Hang", requiresLoad: false },
  { value: "farmer_walk", label: "Farmer's Walk", requiresLoad: true },
  { value: "plank", label: "Plank", requiresLoad: false },
  { value: "wall_sit", label: "Wall Sit", requiresLoad: false },
  { value: "pull_ups", label: "Pull-Ups", requiresLoad: false },
  { value: "balance_open_l", label: "Single-Leg Balance (Eyes Open - Left)", requiresLoad: false },
  { value: "balance_open_r", label: "Single-Leg Balance (Eyes Open - Right)", requiresLoad: false },
  { value: "balance_closed_l", label: "Single-Leg Balance (Eyes Closed - Left)", requiresLoad: false },
  { value: "balance_closed_r", label: "Single-Leg Balance (Eyes Closed - Right)", requiresLoad: false },
  { value: "floor_getup", label: "Floor Get-Up", requiresLoad: false },
  { value: "deadlift_reps", label: "Deadlift (Bodyweight x10)", requiresLoad: true },
  { value: "grip_l", label: "Grip Strength (Left)", requiresLoad: false },
  { value: "grip_r", label: "Grip Strength (Right)", requiresLoad: false },
  { value: "mile_run", label: "1-Mile Run", requiresLoad: false },
];

const getUnitLabel = (testType: string): string => {
  const units: Record<string, string> = {
    dead_hang: "seconds",
    farmer_walk: "seconds",
    plank: "seconds",
    wall_sit: "seconds",
    pull_ups: "reps",
    balance_open_l: "seconds",
    balance_open_r: "seconds",
    balance_closed_l: "seconds",
    balance_closed_r: "seconds",
    floor_getup: "arms used (0 = no hands)",
    deadlift_reps: "reps",
    grip_l: "kg",
    grip_r: "kg",
    mile_run: "seconds (or use mm:ss format)",
  };
  return units[testType] || "value";
};

export function TestForm({ onSuccess }: TestFormProps) {
  const router = useRouter();
  const [testType, setTestType] = useState("");
  const [value, setValue] = useState("");
  const [loadKg, setLoadKg] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedTest = TEST_OPTIONS.find(opt => opt.value === testType);
  const requiresLoad = selectedTest?.requiresLoad || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!testType || !value) {
      setError("Please select a test type and enter a value");
      return;
    }

    // Parse value - handle mm:ss format
    let numericValue: number;
    if (value.includes(':')) {
      const [mins, secs] = value.split(':').map(Number);
      if (isNaN(mins) || isNaN(secs)) {
        setError("Invalid time format. Use mm:ss or just seconds");
        return;
      }
      numericValue = mins * 60 + secs;
    } else {
      numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        setError("Please enter a valid number");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/metrics/functional", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test_type: testType,
          value: numericValue,
          date,
          load_kg: loadKg ? parseFloat(loadKg) : null,
          notes: notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save test");
      }

      // Reset form
      setTestType("");
      setValue("");
      setLoadKg("");
      setNotes("");
      setDate(new Date().toISOString().split('T')[0]);

      // Refresh the page data
      router.refresh();

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Show success message if it's a PR
      if (data.message && data.message.includes("personal record")) {
        alert("🎉 " + data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save test");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="test-type">Benchmark Test</Label>
        <Select value={testType} onValueChange={setTestType}>
          <SelectTrigger id="test-type">
            <SelectValue placeholder="Select a test" />
          </SelectTrigger>
          <SelectContent>
            {TEST_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {testType && (
        <>
          <div className="space-y-2">
            <Label htmlFor="value">
              Result ({getUnitLabel(testType)})
            </Label>
            <Input
              id="value"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                testType === "mile_run"
                  ? "e.g., 7:30 or 450"
                  : testType === "floor_getup"
                  ? "0 for no hands, 1 for one hand, etc."
                  : "Enter value"
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              {testType === "mile_run" && "You can enter time as mm:ss (e.g., 7:30) or total seconds (e.g., 450)"}
              {testType === "floor_getup" && "Enter 0 if you can get up without using your hands"}
            </p>
          </div>

          {requiresLoad && (
            <div className="space-y-2">
              <Label htmlFor="load">
                Load (kg)
                {testType === "farmer_walk" && " - Total weight carried"}
                {testType === "deadlift_reps" && " - Weight on the bar"}
              </Label>
              <Input
                id="load"
                type="number"
                step="0.5"
                value={loadKg}
                onChange={(e) => setLoadKg(e.target.value)}
                placeholder="e.g., 80"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Test Result"}
          </Button>
        </>
      )}
    </form>
  );
}

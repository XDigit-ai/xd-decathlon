"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Scale, Heart, Activity, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface QuickAddProps {
  className?: string;
}

export function QuickAdd({ className }: QuickAddProps) {
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [wellness, setWellness] = useState({
    energy: 0,
    mood: 0,
    soreness: 0,
    motivation: 0,
    stress: 0,
  });
  const [vo2max, setVo2max] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleWellnessChange = (key: keyof typeof wellness, value: number) => {
    setWellness((prev) => ({ ...prev, [key]: value }));
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleWeightSubmit = async () => {
    if (!weight) return;

    setLoading("weight");
    try {
      const response = await fetch("/api/metrics/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "weight",
          weight_kg: parseFloat(weight),
          body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("success", "Weight saved successfully");
        setWeight("");
        setBodyFat("");
        router.refresh();
      } else {
        showMessage("error", data.error || "Failed to save weight");
      }
    } catch (error) {
      showMessage("error", "Failed to save weight");
    } finally {
      setLoading(null);
    }
  };

  const handleWellnessSubmit = async () => {
    const hasAnyValue = Object.values(wellness).some((v) => v > 0);
    if (!hasAnyValue) return;

    setLoading("wellness");
    try {
      const response = await fetch("/api/metrics/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "wellness",
          ...wellness,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("success", "Wellness saved successfully");
        setWellness({ energy: 0, mood: 0, soreness: 0, motivation: 0, stress: 0 });
        router.refresh();
      } else {
        showMessage("error", data.error || "Failed to save wellness");
      }
    } catch (error) {
      showMessage("error", "Failed to save wellness");
    } finally {
      setLoading(null);
    }
  };

  const handleVo2maxSubmit = async () => {
    if (!vo2max) return;

    setLoading("vo2max");
    try {
      const response = await fetch("/api/metrics/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "vo2max",
          value: parseFloat(vo2max),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("success", "VO2 Max saved successfully");
        setVo2max("");
        router.refresh();
      } else {
        showMessage("error", data.error || "Failed to save VO2 Max");
      }
    } catch (error) {
      showMessage("error", "Failed to save VO2 Max");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Quick Add</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toast message */}
        {message && (
          <div
            className={cn(
              "rounded-md p-3 text-sm",
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            )}
          >
            {message.text}
          </div>
        )}

        {/* Weight */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="weight">Body Weight</Label>
          </div>
          <div className="space-y-2">
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              disabled={loading === "weight"}
            />
            <Input
              id="bodyfat"
              type="number"
              step="0.1"
              placeholder="Body Fat % (optional)"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              disabled={loading === "weight"}
            />
            <Button
              onClick={handleWeightSubmit}
              disabled={!weight || loading === "weight"}
              className="w-full"
              size="sm"
            >
              {loading === "weight" ? "Saving..." : "Add Weight"}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Wellness ratings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-muted-foreground" />
            <Label>Wellness Ratings</Label>
          </div>
          <div className="space-y-4">
            {(["energy", "mood", "soreness", "motivation", "stress"] as const).map((key) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm capitalize">{key}</span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {wellness[key]}/5
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleWellnessChange(key, value)}
                      disabled={loading === "wellness"}
                      className={cn(
                        "flex h-8 flex-1 items-center justify-center rounded border border-input transition-colors hover:bg-accent disabled:opacity-50",
                        wellness[key] >= value
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : ""
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={handleWellnessSubmit}
            className="w-full"
            disabled={Object.values(wellness).every((v) => v === 0) || loading === "wellness"}
          >
            {loading === "wellness" ? "Saving..." : "Save Wellness"}
          </Button>
        </div>

        <Separator />

        {/* VO2 max */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="vo2max">VO2 Max</Label>
          </div>
          <div className="flex gap-2">
            <Input
              id="vo2max"
              type="number"
              step="0.1"
              placeholder="ml/kg/min"
              value={vo2max}
              onChange={(e) => setVo2max(e.target.value)}
              disabled={loading === "vo2max"}
            />
            <Button
              onClick={handleVo2maxSubmit}
              disabled={!vo2max || loading === "vo2max"}
            >
              {loading === "vo2max" ? "..." : "Add"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

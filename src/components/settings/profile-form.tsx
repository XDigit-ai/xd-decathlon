"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface ProfileFormProps {
  profile: {
    id: string;
    display_name: string | null;
    height_cm: number | null;
    weight_unit: string | null;
    distance_unit: string | null;
    resting_hr: number | null;
    hrv_baseline: number | null;
    max_hr: number | null;
  } | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    height_cm: profile?.height_cm?.toString() || "",
    weight_unit: profile?.weight_unit || "kg",
    distance_unit: profile?.distance_unit || "km",
    resting_hr: profile?.resting_hr?.toString() || "56",
    hrv_baseline: profile?.hrv_baseline?.toString() || "65",
    max_hr: profile?.max_hr?.toString() || "178",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showMessage("error", "Not authenticated");
        setLoading(false);
        return;
      }

      const updateData: any = {
        display_name: formData.display_name || null,
        weight_unit: formData.weight_unit,
        distance_unit: formData.distance_unit,
        resting_hr: formData.resting_hr ? parseInt(formData.resting_hr) : null,
        hrv_baseline: formData.hrv_baseline ? parseFloat(formData.hrv_baseline) : null,
        max_hr: formData.max_hr ? parseInt(formData.max_hr) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...updateData,
        });

      if (error) {
        console.error("Profile update error:", error);
        showMessage("error", "Failed to update profile");
      } else {
        showMessage("success", "Profile updated successfully");
        router.refresh();
      }
    } catch (error) {
      console.error("Profile update error:", error);
      showMessage("error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <div
            className={`mb-4 rounded-md p-3 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              type="text"
              value={formData.display_name}
              onChange={(e) => handleChange("display_name", e.target.value)}
              placeholder="Your name"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height_cm">Height (cm)</Label>
              <Input
                id="height_cm"
                type="number"
                step="0.1"
                value={formData.height_cm}
                onChange={(e) => handleChange("height_cm", e.target.value)}
                placeholder="175"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight_unit">Weight Unit</Label>
              <select
                id="weight_unit"
                value={formData.weight_unit}
                onChange={(e) => handleChange("weight_unit", e.target.value)}
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="distance_unit">Distance Unit</Label>
            <select
              id="distance_unit"
              value={formData.distance_unit}
              onChange={(e) => handleChange("distance_unit", e.target.value)}
              disabled={loading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="km">Kilometers (km)</option>
              <option value="mi">Miles (mi)</option>
            </select>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold mb-3">Baselines</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resting_hr">Resting HR</Label>
                <Input
                  id="resting_hr"
                  type="number"
                  value={formData.resting_hr}
                  onChange={(e) => handleChange("resting_hr", e.target.value)}
                  placeholder="56"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">bpm</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hrv_baseline">HRV Baseline</Label>
                <Input
                  id="hrv_baseline"
                  type="number"
                  step="0.1"
                  value={formData.hrv_baseline}
                  onChange={(e) => handleChange("hrv_baseline", e.target.value)}
                  placeholder="65"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">ms</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_hr">Max HR</Label>
                <Input
                  id="max_hr"
                  type="number"
                  value={formData.max_hr}
                  onChange={(e) => handleChange("max_hr", e.target.value)}
                  placeholder="178"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">bpm</p>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

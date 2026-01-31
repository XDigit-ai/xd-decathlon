"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Modal, Select } from "@/components/ui";
import { Plus, Scale, Smile, Activity } from "lucide-react";
import { useState } from "react";

interface QuickAddProps {
  onAddWeight?: (weight: number, date: string) => void;
  onAddWellness?: (data: WellnessData) => void;
  onAddVo2Max?: (value: number, source: string) => void;
}

interface WellnessData {
  energy: number;
  stress: number;
  motivation: number;
  soreness: number;
}

export function QuickAdd({ onAddWeight, onAddWellness, onAddVo2Max }: QuickAddProps) {
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isWellnessModalOpen, setIsWellnessModalOpen] = useState(false);
  const [isVo2ModalOpen, setIsVo2ModalOpen] = useState(false);

  const [weight, setWeight] = useState("");
  const [vo2Value, setVo2Value] = useState("");
  const [vo2Source, setVo2Source] = useState("manual");
  const [wellness, setWellness] = useState<WellnessData>({
    energy: 5,
    stress: 5,
    motivation: 5,
    soreness: 5,
  });

  const handleAddWeight = () => {
    const w = parseFloat(weight);
    if (!isNaN(w) && w > 0) {
      onAddWeight?.(w, new Date().toISOString().split("T")[0]);
      setWeight("");
      setIsWeightModalOpen(false);
    }
  };

  const handleAddVo2 = () => {
    const v = parseFloat(vo2Value);
    if (!isNaN(v) && v > 0) {
      onAddVo2Max?.(v, vo2Source);
      setVo2Value("");
      setIsVo2ModalOpen(false);
    }
  };

  const handleAddWellness = () => {
    onAddWellness?.(wellness);
    setIsWellnessModalOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-500" />
            Quick Add
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3"
              onClick={() => setIsWeightModalOpen(true)}
            >
              <Scale className="h-5 w-5" />
              <span className="text-xs">Weight</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3"
              onClick={() => setIsWellnessModalOpen(true)}
            >
              <Smile className="h-5 w-5" />
              <span className="text-xs">Wellness</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3"
              onClick={() => setIsVo2ModalOpen(true)}
            >
              <Activity className="h-5 w-5" />
              <span className="text-xs">VO2 Max</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weight Modal */}
      <Modal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        title="Log Weight"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            placeholder="e.g., 83.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsWeightModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleAddWeight}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Wellness Modal */}
      <Modal
        isOpen={isWellnessModalOpen}
        onClose={() => setIsWellnessModalOpen(false)}
        title="Log Wellness"
        size="sm"
      >
        <div className="space-y-4">
          {[
            { key: "energy", label: "Energy Level" },
            { key: "stress", label: "Stress Level" },
            { key: "motivation", label: "Motivation" },
            { key: "soreness", label: "Soreness" },
          ].map((item) => (
            <div key={item.key}>
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <span>{item.label}</span>
                <span className="text-zinc-500">
                  {wellness[item.key as keyof WellnessData]}/10
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={wellness[item.key as keyof WellnessData]}
                onChange={(e) =>
                  setWellness({
                    ...wellness,
                    [item.key]: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsWellnessModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleAddWellness}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* VO2 Max Modal */}
      <Modal
        isOpen={isVo2ModalOpen}
        onClose={() => setIsVo2ModalOpen(false)}
        title="Log VO2 Max"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="VO2 Max (mL/kg/min)"
            type="number"
            step="0.1"
            placeholder="e.g., 45.2"
            value={vo2Value}
            onChange={(e) => setVo2Value(e.target.value)}
          />
          <Select
            label="Source"
            value={vo2Source}
            onChange={(e) => setVo2Source(e.target.value)}
            options={[
              { value: "manual", label: "Manual Entry" },
              { value: "apple_watch", label: "Apple Watch" },
              { value: "whoop", label: "Whoop" },
              { value: "cooper_test", label: "Cooper Test" },
            ]}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsVo2ModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleAddVo2}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

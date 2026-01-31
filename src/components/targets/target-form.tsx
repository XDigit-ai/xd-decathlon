'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { TARGET_METRICS, DOMAIN_CATEGORIES } from '@/types/targets';
import type { TargetDomain } from '@/types/database';
import type { CreateTargetInput } from '@/types/targets';

interface TargetFormProps {
  onSuccess: () => void;
}

export function TargetForm({ onSuccess }: TargetFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<TargetDomain | ''>('');
  const [formData, setFormData] = useState({
    baseline: '',
    target_3m: '',
    target_6m: '',
    target_12m: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDomain) {
      alert('Please select a fitness domain');
      return;
    }

    if (!formData.target_3m && !formData.target_6m && !formData.target_12m) {
      alert('Please set at least one target (3m, 6m, or 12m)');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateTargetInput = {
        domain: selectedDomain,
        baseline: formData.baseline ? parseFloat(formData.baseline) : null,
        target_3m: formData.target_3m ? parseFloat(formData.target_3m) : null,
        target_6m: formData.target_6m ? parseFloat(formData.target_6m) : null,
        target_12m: formData.target_12m ? parseFloat(formData.target_12m) : null,
        notes: formData.notes || undefined,
      };

      const response = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsOpen(false);
        setSelectedDomain('');
        setFormData({
          baseline: '',
          target_3m: '',
          target_6m: '',
          target_12m: '',
          notes: '',
        });
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create target');
      }
    } catch (error) {
      console.error('Error creating target:', error);
      alert('An error occurred while creating the target');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMetric = selectedDomain ? TARGET_METRICS[selectedDomain] : null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Target
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Target</DialogTitle>
          <DialogDescription>
            Set a new fitness goal and track your progress over time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Fitness Domain</Label>
              <Select
                value={selectedDomain}
                onValueChange={(value) => setSelectedDomain(value as TargetDomain)}
              >
                <SelectTrigger id="domain">
                  <SelectValue placeholder="Select a fitness domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Body Composition</SelectLabel>
                    {DOMAIN_CATEGORIES.body.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {TARGET_METRICS[domain].name}
                      </SelectItem>
                    ))}
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel>Strength</SelectLabel>
                    {DOMAIN_CATEGORIES.strength.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {TARGET_METRICS[domain].name}
                      </SelectItem>
                    ))}
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel>Cardio</SelectLabel>
                    {DOMAIN_CATEGORIES.cardio.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {TARGET_METRICS[domain].name}
                      </SelectItem>
                    ))}
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel>Functional</SelectLabel>
                    {DOMAIN_CATEGORIES.functional.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {TARGET_METRICS[domain].name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {selectedMetric && (
                <p className="text-xs text-muted-foreground">
                  {selectedMetric.description} (measured in {selectedMetric.unit})
                </p>
              )}
            </div>

            {selectedDomain && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="baseline">
                    Baseline Value ({selectedMetric?.unit})
                  </Label>
                  <Input
                    id="baseline"
                    type="number"
                    step="0.01"
                    value={formData.baseline}
                    onChange={(e) =>
                      setFormData({ ...formData, baseline: e.target.value })
                    }
                    placeholder="Current/starting value"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your current or starting value for this metric
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="target_3m">
                      3-Month Target ({selectedMetric?.unit})
                    </Label>
                    <Input
                      id="target_3m"
                      type="number"
                      step="0.01"
                      value={formData.target_3m}
                      onChange={(e) =>
                        setFormData({ ...formData, target_3m: e.target.value })
                      }
                      placeholder="3-month goal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_6m">
                      6-Month Target ({selectedMetric?.unit})
                    </Label>
                    <Input
                      id="target_6m"
                      type="number"
                      step="0.01"
                      value={formData.target_6m}
                      onChange={(e) =>
                        setFormData({ ...formData, target_6m: e.target.value })
                      }
                      placeholder="6-month goal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_12m">
                      12-Month Target ({selectedMetric?.unit})
                    </Label>
                    <Input
                      id="target_12m"
                      type="number"
                      step="0.01"
                      value={formData.target_12m}
                      onChange={(e) =>
                        setFormData({ ...formData, target_12m: e.target.value })
                      }
                      placeholder="12-month goal"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Any additional notes or context"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedDomain}>
              {isSubmitting ? 'Creating...' : 'Create Target'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

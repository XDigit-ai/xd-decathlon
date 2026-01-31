'use client';

import { useRouter } from 'next/navigation';
import { TargetCard } from './target-card';
import { TargetForm } from './target-form';
import type { TargetWithProgress, FitnessDomainCategory } from '@/types/targets';

interface TargetGridProps {
  targetsByCategory: Record<FitnessDomainCategory, TargetWithProgress[]>;
}

export function TargetGrid({ targetsByCategory }: TargetGridProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  const categoryNames: Record<FitnessDomainCategory, string> = {
    body: 'Body Composition',
    strength: 'Strength',
    cardio: 'Cardio',
    functional: 'Functional Fitness',
    recovery: 'Recovery',
  };

  const hasAnyTargets = Object.values(targetsByCategory).some(
    (targets) => targets.length > 0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals & Targets</h1>
          <p className="text-muted-foreground">
            Set and track your fitness goals across multiple timeframes
          </p>
        </div>
        <TargetForm onSuccess={handleRefresh} />
      </div>

      {!hasAnyTargets ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <svg
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No targets yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start your fitness journey by setting your first goal. Choose from strength,
            cardio, body composition, or functional fitness targets.
          </p>
          <TargetForm onSuccess={handleRefresh} />
        </div>
      ) : (
        <div className="space-y-8">
          {(Object.keys(targetsByCategory) as FitnessDomainCategory[]).map(
            (category) => {
              const targets = targetsByCategory[category];
              if (targets.length === 0) return null;

              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">
                      {categoryNames[category]}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      ({targets.length})
                    </span>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {targets.map((target) => (
                      <TargetCard
                        key={target.id}
                        target={target}
                        onUpdate={handleRefresh}
                      />
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

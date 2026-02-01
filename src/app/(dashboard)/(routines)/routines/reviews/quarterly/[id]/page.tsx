import { Suspense } from 'react';
import { getAuthUser } from '@/lib/supabase/auth';
import { notFound } from 'next/navigation';

interface QuarterlyReviewPageProps {
  params: {
    id: string;
  };
}

// TODO: Define proper types for quarterly review data
interface QuarterlyReview {
  id: string;
  quarter: 1 | 2 | 3 | 4;
  year: number;
  status: 'draft' | 'completed';
  totalWorkouts: number;
  avgRecovery: number;
  majorMilestones: string[];
  trainingCycleReview: string;
  bodyCompositionJourney: {
    startWeight: number;
    endWeight: number;
    startBodyFat: number;
    endBodyFat: number;
  };
  functionalBenchmarks: {
    name: string;
    startValue: number;
    endValue: number;
    improvement: number;
  }[];
  biggestWins: string[];
  areasForImprovement: string[];
  nextQuarterPlan: string;
  notes?: string;
}

async function getQuarterlyReview(id: string): Promise<QuarterlyReview | null> {
  // TODO: Fetch quarterly review data from Supabase
  return null;
}

export default async function QuarterlyReviewPage({
  params,
}: QuarterlyReviewPageProps) {
  await getAuthUser();

  const review = await getQuarterlyReview(params.id);

  if (!review) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quarterly Review</h1>
          <p className="mt-1 text-sm text-gray-500">
            Q{review.quarter} {review.year}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Mark Complete
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Workouts</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {review.totalWorkouts}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Avg Recovery</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {review.avgRecovery}%
          </p>
        </div>
      </div>

      {/* Body Composition Journey */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Body Composition Journey
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Weight Change</p>
            <p className="text-2xl font-bold text-blue-600">
              {review.bodyCompositionJourney.startWeight} kg →{' '}
              {review.bodyCompositionJourney.endWeight} kg
            </p>
            <p className="text-sm text-gray-600">
              (
              {review.bodyCompositionJourney.endWeight -
                review.bodyCompositionJourney.startWeight >
              0
                ? '+'
                : ''}
              {(
                review.bodyCompositionJourney.endWeight -
                review.bodyCompositionJourney.startWeight
              ).toFixed(1)}{' '}
              kg)
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Body Fat Change</p>
            <p className="text-2xl font-bold text-orange-600">
              {review.bodyCompositionJourney.startBodyFat}% →{' '}
              {review.bodyCompositionJourney.endBodyFat}%
            </p>
            <p className="text-sm text-gray-600">
              (
              {review.bodyCompositionJourney.endBodyFat -
                review.bodyCompositionJourney.startBodyFat >
              0
                ? '+'
                : ''}
              {(
                review.bodyCompositionJourney.endBodyFat -
                review.bodyCompositionJourney.startBodyFat
              ).toFixed(1)}
              %)
            </p>
          </div>
        </div>
      </div>

      {/* Functional Benchmarks */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Functional Benchmark Progress
        </h2>
        <Suspense fallback={<div>Loading benchmarks...</div>}>
          {review.functionalBenchmarks.length === 0 ? (
            <p className="text-gray-500">No benchmark data available</p>
          ) : (
            <div className="space-y-4">
              {review.functionalBenchmarks.map((benchmark, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                  <h4 className="font-medium text-gray-900">{benchmark.name}</h4>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-gray-600">
                      {benchmark.startValue} → {benchmark.endValue}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        benchmark.improvement > 0
                          ? 'bg-green-100 text-green-800'
                          : benchmark.improvement < 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {benchmark.improvement > 0 ? '+' : ''}
                      {benchmark.improvement}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Suspense>
      </div>

      {/* Major Milestones */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Major Milestones
        </h2>
        <Suspense fallback={<div>Loading milestones...</div>}>
          {review.majorMilestones.length === 0 ? (
            <p className="text-gray-500">No milestones recorded</p>
          ) : (
            <ul className="space-y-2">
              {review.majorMilestones.map((milestone, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-500 mr-2">⭐</span>
                  <span className="text-gray-700">{milestone}</span>
                </li>
              ))}
            </ul>
          )}
        </Suspense>
      </div>

      {/* Biggest Wins */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Biggest Wins</h2>
        <Suspense fallback={<div>Loading wins...</div>}>
          {review.biggestWins.length === 0 ? (
            <p className="text-gray-500">No wins recorded</p>
          ) : (
            <ul className="space-y-2">
              {review.biggestWins.map((win, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">🎉</span>
                  <span className="text-gray-700">{win}</span>
                </li>
              ))}
            </ul>
          )}
        </Suspense>
      </div>

      {/* Areas for Improvement */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Areas for Improvement
        </h2>
        <Suspense fallback={<div>Loading improvements...</div>}>
          {review.areasForImprovement.length === 0 ? (
            <p className="text-gray-500">No areas identified</p>
          ) : (
            <ul className="space-y-2">
              {review.areasForImprovement.map((area, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-500 mr-2">📈</span>
                  <span className="text-gray-700">{area}</span>
                </li>
              ))}
            </ul>
          )}
        </Suspense>
      </div>

      {/* Training Cycle Review */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Training Cycle Review
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap">
          {review.trainingCycleReview || 'No review written'}
        </p>
      </div>

      {/* Next Quarter Plan */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Next Quarter Plan
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap">
          {review.nextQuarterPlan || 'No plan written'}
        </p>
      </div>

      {/* Notes */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
        <p className="text-gray-700 whitespace-pre-wrap">
          {review.notes || 'No notes added'}
        </p>
      </div>
    </div>
  );
}

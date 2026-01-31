import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

interface WeeklyReviewPageProps {
  params: {
    id: string;
  };
}

// TODO: Define proper types for weekly review data
interface WeeklyReview {
  id: string;
  weekStart: string;
  weekEnd: string;
  status: 'draft' | 'completed';
  workoutCompliance: number;
  totalVolume: number;
  avgRecovery: number;
  highlights: string[];
  concerns: string[];
  notes?: string;
}

async function getWeeklyReview(id: string): Promise<WeeklyReview | null> {
  // TODO: Fetch weekly review data from Supabase
  return null;
}

export default async function WeeklyReviewPage({ params }: WeeklyReviewPageProps) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const review = await getWeeklyReview(params.id);

  if (!review) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Review</h1>
          <p className="mt-1 text-sm text-gray-500">
            {review.weekStart} - {review.weekEnd}
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Workout Compliance</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {review.workoutCompliance}%
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Volume</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {review.totalVolume} kg
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Avg Recovery</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">
            {review.avgRecovery}%
          </p>
        </div>
      </div>

      {/* Highlights */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Highlights</h2>
        <Suspense fallback={<div>Loading highlights...</div>}>
          {review.highlights.length === 0 ? (
            <p className="text-gray-500">No highlights recorded</p>
          ) : (
            <ul className="space-y-2">
              {review.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">{highlight}</span>
                </li>
              ))}
            </ul>
          )}
        </Suspense>
      </div>

      {/* Concerns */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Concerns</h2>
        <Suspense fallback={<div>Loading concerns...</div>}>
          {review.concerns.length === 0 ? (
            <p className="text-gray-500">No concerns recorded</p>
          ) : (
            <ul className="space-y-2">
              {review.concerns.map((concern, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-500 mr-2">⚠</span>
                  <span className="text-gray-700">{concern}</span>
                </li>
              ))}
            </ul>
          )}
        </Suspense>
      </div>

      {/* Notes */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
        <Suspense fallback={<div>Loading notes...</div>}>
          {review.notes ? (
            <p className="text-gray-700 whitespace-pre-wrap">{review.notes}</p>
          ) : (
            <p className="text-gray-500">No notes added</p>
          )}
        </Suspense>
      </div>
    </div>
  );
}

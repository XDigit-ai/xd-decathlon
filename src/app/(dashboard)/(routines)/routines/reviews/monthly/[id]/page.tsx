import { Suspense } from 'react';
import { getAuthUser } from '@/lib/supabase/auth';
import { notFound } from 'next/navigation';

interface MonthlyReviewPageProps {
  params: {
    id: string;
  };
}

// TODO: Define proper types for monthly review data
interface MonthlyReview {
  id: string;
  month: string;
  year: number;
  status: 'draft' | 'completed';
  totalWorkouts: number;
  avgRecovery: number;
  strengthPRs: number;
  bodyCompositionChange: {
    weight: number;
    bodyFat: number;
  };
  topAchievements: string[];
  lessonsLearned: string[];
  nextMonthGoals: string[];
  notes?: string;
}

async function getMonthlyReview(id: string): Promise<MonthlyReview | null> {
  // TODO: Fetch monthly review data from Supabase
  return null;
}

export default async function MonthlyReviewPage({
  params,
}: MonthlyReviewPageProps) {
  await getAuthUser();

  const review = await getMonthlyReview(params.id);

  if (!review) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Review</h1>
          <p className="mt-1 text-sm text-gray-500">
            {review.month} {review.year}
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
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
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Strength PRs</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">
            {review.strengthPRs}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Body Changes</h3>
          <p className="mt-2 text-lg font-bold text-orange-600">
            {review.bodyCompositionChange.weight > 0 ? '+' : ''}
            {review.bodyCompositionChange.weight} kg
          </p>
          <p className="text-sm text-gray-500">
            BF: {review.bodyCompositionChange.bodyFat > 0 ? '+' : ''}
            {review.bodyCompositionChange.bodyFat}%
          </p>
        </div>
      </div>

      {/* Top Achievements */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Top Achievements
        </h2>
        <Suspense fallback={<div>Loading achievements...</div>}>
          {review.topAchievements.length === 0 ? (
            <p className="text-gray-500">No achievements recorded</p>
          ) : (
            <ul className="space-y-2">
              {review.topAchievements.map((achievement, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">🏆</span>
                  <span className="text-gray-700">{achievement}</span>
                </li>
              ))}
            </ul>
          )}
        </Suspense>
      </div>

      {/* Lessons Learned */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Lessons Learned
        </h2>
        <Suspense fallback={<div>Loading lessons...</div>}>
          {review.lessonsLearned.length === 0 ? (
            <p className="text-gray-500">No lessons recorded</p>
          ) : (
            <ul className="space-y-2">
              {review.lessonsLearned.map((lesson, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">💡</span>
                  <span className="text-gray-700">{lesson}</span>
                </li>
              ))}
            </ul>
          )}
        </Suspense>
      </div>

      {/* Next Month Goals */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Next Month Goals
        </h2>
        <Suspense fallback={<div>Loading goals...</div>}>
          {review.nextMonthGoals.length === 0 ? (
            <p className="text-gray-500">No goals set</p>
          ) : (
            <ul className="space-y-2">
              {review.nextMonthGoals.map((goal, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-500 mr-2">🎯</span>
                  <span className="text-gray-700">{goal}</span>
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

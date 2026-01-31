import { Suspense } from 'react';
import { DEV_USER_ID } from '@/lib/supabase/server';
import Link from 'next/link';

// TODO: Define proper types for reviews
interface Review {
  id: string;
  type: 'weekly' | 'monthly' | 'quarterly';
  date: string;
  title: string;
  summary?: string;
  status: 'draft' | 'completed';
}

async function getReviews(): Promise<Review[]> {
  // TODO: Fetch reviews from Supabase
  return [];
}

export default async function ReviewsPage() {
  const userId = DEV_USER_ID;

  const reviews = await getReviews();

  const reviewTypeColors = {
    weekly: 'bg-blue-100 text-blue-800',
    monthly: 'bg-green-100 text-green-800',
    quarterly: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Archive</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your weekly, monthly, and quarterly reviews
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Review
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              type="button"
              className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              All Reviews
            </button>
            <button
              type="button"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Weekly
            </button>
            <button
              type="button"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Monthly
            </button>
            <button
              type="button"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Quarterly
            </button>
          </nav>
        </div>
      </div>

      {/* Reviews List */}
      <Suspense fallback={<div>Loading reviews...</div>}>
        {reviews.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No reviews yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first review.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Review
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <li key={review.id}>
                  <Link
                    href={`/routines/reviews/${review.type}/${review.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              reviewTypeColors[review.type]
                            }`}
                          >
                            {review.type}
                          </span>
                          <p className="ml-3 text-sm font-medium text-blue-600 truncate">
                            {review.title}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              review.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {review.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {review.date}
                          </p>
                        </div>
                        {review.summary && (
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p className="truncate">{review.summary}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Suspense>
    </div>
  );
}

import { Suspense } from 'react';
import { DEV_USER_ID } from '@/lib/supabase/server';

// TODO: Define proper types for progress photos
interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
  angle: 'front' | 'back' | 'side';
  notes?: string;
}

async function getProgressPhotos(): Promise<ProgressPhoto[]> {
  // TODO: Fetch progress photos from Supabase Storage
  return [];
}

export default async function ProgressPhotosPage() {
  const userId = DEV_USER_ID;

  const photos = await getProgressPhotos();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Photos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your physical transformation over time
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Upload Photos
        </button>
      </div>

      {/* Filter/View Options */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="angle-filter" className="block text-sm font-medium text-gray-700">
              Angle
            </label>
            <select
              id="angle-filter"
              name="angle-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option>All Angles</option>
              <option>Front</option>
              <option>Back</option>
              <option>Side</option>
            </select>
          </div>
          <div>
            <label htmlFor="date-range" className="block text-sm font-medium text-gray-700">
              Date Range
            </label>
            <select
              id="date-range"
              name="date-range"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option>All Time</option>
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Compare Mode
            </button>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      <Suspense fallback={<div>Loading photos...</div>}>
        {photos.length === 0 ? (
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No progress photos
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading your first progress photo.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Upload Photos
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                {/* TODO: Implement photo display */}
                <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                  {/* Photo will be displayed here */}
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-900">{photo.date}</p>
                  <p className="text-sm text-gray-500">{photo.angle}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}

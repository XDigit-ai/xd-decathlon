import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';

// TODO: Define proper types for training plan data
interface TrainingPlan {
  weeklySchedule: {
    day: string;
    type: string;
    exercises?: string[];
    duration?: number;
    notes?: string;
  }[];
  heartRateZones: {
    zone: number;
    name: string;
    minBPM: number;
    maxBPM: number;
    purpose: string;
  }[];
  exerciseLibrary: {
    name: string;
    category: string;
    sets: number;
    reps: string;
    rest: string;
    notes?: string;
  }[];
}

async function getTrainingPlan(): Promise<TrainingPlan> {
  // TODO: Fetch training plan from Supabase
  return {
    weeklySchedule: [],
    heartRateZones: [],
    exerciseLibrary: [],
  };
}

export default async function TrainingPlanPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const plan = await getTrainingPlan();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Plan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your weekly training schedule and reference guide
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit Plan
        </button>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Weekly Schedule
        </h2>
        <Suspense fallback={<div>Loading schedule...</div>}>
          {plan.weeklySchedule.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No training schedule set up yet
            </p>
          ) : (
            <div className="space-y-4">
              {plan.weeklySchedule.map((day, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{day.day}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {day.type}
                    </span>
                  </div>
                  {day.exercises && day.exercises.length > 0 && (
                    <ul className="text-sm text-gray-600 space-y-1 mb-2">
                      {day.exercises.map((exercise, i) => (
                        <li key={i}>• {exercise}</li>
                      ))}
                    </ul>
                  )}
                  {day.duration && (
                    <p className="text-sm text-gray-500">
                      Duration: {day.duration} minutes
                    </p>
                  )}
                  {day.notes && (
                    <p className="text-sm text-gray-500 mt-2">{day.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Suspense>
      </div>

      {/* Heart Rate Zones */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Heart Rate Zones
        </h2>
        <Suspense fallback={<div>Loading zones...</div>}>
          {plan.heartRateZones.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No heart rate zones configured
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Range (BPM)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plan.heartRateZones.map((zone) => (
                    <tr key={zone.zone}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Zone {zone.zone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {zone.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {zone.minBPM} - {zone.maxBPM}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {zone.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Suspense>
      </div>

      {/* Exercise Library */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Exercise Library
        </h2>
        <Suspense fallback={<div>Loading exercises...</div>}>
          {plan.exerciseLibrary.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No exercises in library yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exercise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reps
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plan.exerciseLibrary.map((exercise, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {exercise.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exercise.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exercise.sets}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exercise.reps}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exercise.rest}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {exercise.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}

import { Suspense } from 'react';
import { getAuthUser } from '@/lib/supabase/auth';

// TODO: Define proper types for cardio data
interface CardioData {
  vo2Max: number;
  vo2MaxTrend: any[];
  hiitCompliance: number;
  zone2Minutes: number;
  heartRateZones: any[];
}

async function getCardioData(): Promise<CardioData> {
  // TODO: Fetch cardio metrics from Whoop and calculate compliance
  return {
    vo2Max: 0,
    vo2MaxTrend: [],
    hiitCompliance: 0,
    zone2Minutes: 0,
    heartRateZones: [],
  };
}

export default async function CardioPage() {
  await getAuthUser();

  const cardioData = await getCardioData();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cardio Training</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your VO2 max, heart rate zones, and training compliance
        </p>
      </div>

      {/* VO2 Max Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">VO2 Max</h2>
        <Suspense fallback={<div>Loading VO2 max...</div>}>
          <div className="text-3xl font-bold text-blue-600 mb-4">
            {cardioData.vo2Max > 0 ? `${cardioData.vo2Max} ml/kg/min` : 'N/A'}
          </div>
          {/* TODO: Implement VO2 max trend chart */}
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">VO2 Max Trend (Coming Soon)</p>
          </div>
        </Suspense>
      </div>

      {/* Training Compliance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* HIIT Compliance */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            HIIT Compliance
          </h2>
          <Suspense fallback={<div>Loading compliance...</div>}>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {cardioData.hiitCompliance}%
            </div>
            <p className="text-sm text-gray-500">Weekly target: 1 session</p>
          </Suspense>
        </div>

        {/* Zone 2 Tracker */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Zone 2 Training
          </h2>
          <Suspense fallback={<div>Loading zone 2...</div>}>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {cardioData.zone2Minutes} min
            </div>
            <p className="text-sm text-gray-500">Weekly target: 180 minutes</p>
          </Suspense>
        </div>
      </div>

      {/* Heart Rate Zones */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Heart Rate Zones
        </h2>
        <Suspense fallback={<div>Loading zones...</div>}>
          {/* TODO: Implement heart rate zones chart/table */}
          <div className="space-y-4">
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">Heart Rate Zones Distribution (Coming Soon)</p>
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}

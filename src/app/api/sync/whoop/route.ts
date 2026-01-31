import { NextRequest, NextResponse } from 'next/server';
import { syncWhoopData, getValidAccessToken } from '@/lib/whoop/sync';

/**
 * GET /api/sync/whoop
 *
 * Triggers a Whoop data sync for the dev user.
 * Fetches recovery, sleep, workout, and cycle data from the Whoop API
 * and upserts it into the Supabase database.
 *
 * Query parameters:
 *   - days: Number of days to look back (default: 30, max: 365)
 *   - debug: If "1", tests each endpoint individually and returns debug info
 *
 * In production this would be protected by CRON_SECRET.
 * For development, authentication is skipped.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Debug mode: test each endpoint individually
    if (searchParams.get('debug') === '1') {
      const token = await getValidAccessToken();
      const base = 'https://api.prod.whoop.com/developer';
      const endpoints = [
        { name: 'v1_cycle', path: '/v1/cycle?limit=1' },
        { name: 'v2_cycle', path: '/v2/cycle?limit=1' },
        { name: 'v1_recovery', path: '/v1/recovery?limit=1' },
        { name: 'v2_recovery', path: '/v2/recovery?limit=1' },
        { name: 'v1_sleep', path: '/v1/activity/sleep?limit=1' },
        { name: 'v2_sleep', path: '/v2/activity/sleep?limit=1' },
        { name: 'v1_workout', path: '/v1/activity/workout?limit=1' },
        { name: 'v2_workout', path: '/v2/activity/workout?limit=1' },
      ];

      const results: Record<string, { status: number; body: string }> = {};
      for (const ep of endpoints) {
        const url = `${base}${ep.path}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        results[ep.name] = {
          status: res.status,
          body: (await res.text()).substring(0, 1000),
        };
      }
      return NextResponse.json({ debug: true, results });
    }

    // Normal sync mode
    const daysParam = searchParams.get('days');
    const daysBack = daysParam
      ? Math.min(Math.max(parseInt(daysParam, 10) || 30, 1), 365)
      : 30;

    console.log(`[Whoop Sync API] Starting sync for last ${daysBack} days`);

    const summary = await syncWhoopData(daysBack);

    return NextResponse.json(
      {
        success: summary.success,
        results: {
          recovery_synced: summary.recovery_synced,
          sleep_synced: summary.sleep_synced,
          workouts_synced: summary.workouts_synced,
          cycles_synced: summary.cycles_synced,
          errors: summary.errors,
          duration_ms: summary.duration_ms,
        },
      },
      { status: summary.success ? 200 : 207 }
    );
  } catch (error) {
    console.error('[Whoop Sync API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Whoop sync failed',
      },
      { status: 500 }
    );
  }
}

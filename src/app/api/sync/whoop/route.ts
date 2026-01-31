import { NextRequest, NextResponse } from 'next/server';
import { syncWhoopData } from '@/lib/whoop/sync';

/**
 * GET /api/sync/whoop
 *
 * Triggers a Whoop data sync for the dev user.
 * Fetches recovery, sleep, workout, and cycle data from the Whoop API
 * and upserts it into the Supabase database.
 *
 * Query parameters:
 *   - days: Number of days to look back (default: 30, max: 365)
 *
 * In production this would be protected by CRON_SECRET.
 * For development, authentication is skipped.
 */
export async function GET(request: NextRequest) {
  try {
    // Parse optional days parameter
    const searchParams = request.nextUrl.searchParams;
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

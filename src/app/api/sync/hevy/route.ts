import { NextRequest, NextResponse } from 'next/server';
import { syncAllWorkouts } from '@/lib/hevy/sync';

/**
 * GET /api/sync/hevy
 *
 * Cron job handler for scheduled Hevy data sync
 * Verifies CRON_SECRET header and syncs all workout data from Hevy API
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Hevy Sync API] Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Hevy Sync API] Starting scheduled sync...');

    // Perform full sync
    const syncResult = await syncAllWorkouts();

    // Log results
    console.log('[Hevy Sync API] Sync completed:', {
      success: syncResult.success,
      workouts: syncResult.workouts_processed,
      exercises: syncResult.exercises_processed,
      sets: syncResult.sets_processed,
      oneRMs: syncResult.one_rms_calculated,
      prs: syncResult.prs_detected,
      errors: syncResult.errors.length,
      duration: `${syncResult.duration_ms}ms`,
    });

    // Return success response with summary
    return NextResponse.json(
      {
        success: syncResult.success,
        summary: {
          workouts_processed: syncResult.workouts_processed,
          exercises_processed: syncResult.exercises_processed,
          sets_processed: syncResult.sets_processed,
          one_rms_calculated: syncResult.one_rms_calculated,
          prs_detected: syncResult.prs_detected,
          duration_ms: syncResult.duration_ms,
          started_at: syncResult.started_at,
          completed_at: syncResult.completed_at,
        },
        errors: syncResult.errors,
      },
      { status: syncResult.success ? 200 : 207 } // 207 Multi-Status if there were errors
    );
  } catch (error) {
    console.error('[Hevy Sync API] Sync failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      },
      { status: 500 }
    );
  }
}

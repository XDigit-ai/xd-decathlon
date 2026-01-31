import { NextRequest, NextResponse } from 'next/server';
import { syncWorkout } from '@/lib/hevy/sync';

/**
 * POST /api/webhooks/hevy
 *
 * Webhook handler for Hevy workout updates
 * Receives notifications when workouts are created/updated in Hevy
 * and syncs them to the database
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook authorization
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.HEVY_WEBHOOK_SECRET;

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      console.error('[Hevy Webhook] Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse webhook payload
    const body = await request.json();

    console.log('[Hevy Webhook] Received webhook:', {
      event: body.event,
      workoutId: body.payload?.workoutId || body.id,
    });

    // Extract workout ID from payload
    // Hevy sends: { "id": "event-uuid", "payload": { "workoutId": "workout-uuid" } }
    // Or sometimes: { "id": "workout-uuid" }
    const workoutId = body.payload?.workoutId || body.id;

    if (!workoutId) {
      console.error('[Hevy Webhook] No workout ID in payload');
      return NextResponse.json(
        { error: 'Missing workout ID in payload' },
        { status: 400 }
      );
    }

    // Sync the workout asynchronously (respond quickly to Hevy)
    // Hevy expects a response within 5 seconds
    setImmediate(async () => {
      try {
        const result = await syncWorkout(workoutId);
        console.log('[Hevy Webhook] Workout synced:', result);
      } catch (error) {
        console.error('[Hevy Webhook] Failed to sync workout:', error);
      }
    });

    // Return immediate success response
    return NextResponse.json(
      {
        success: true,
        message: 'Webhook received, processing workout',
        workoutId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Hevy Webhook] Error processing webhook:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

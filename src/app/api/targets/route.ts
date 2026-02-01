import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthUserOrNull } from '@/lib/supabase/auth';
import { TARGET_METRICS } from '@/types/targets';
import type {
  Target,
  TargetDomain,
  TargetStatus,
} from '@/types/database';
import type {
  CreateTargetInput,
  UpdateTargetInput,
  TargetWithProgress,
  TargetMetric,
} from '@/types/targets';

/**
 * Calculate progress percentage for a target
 */
function calculateProgress(
  baseline: number | null,
  current: number | null,
  target: number | null,
  increaseIsBetter: boolean
): number {
  if (baseline === null || target === null || current === null) {
    return 0;
  }

  const totalChange = target - baseline;
  if (totalChange === 0) return 0;

  const currentChange = current - baseline;
  let progress = (currentChange / totalChange) * 100;

  // For metrics where decrease is better, we need to invert the calculation
  if (!increaseIsBetter) {
    progress = progress;
  }

  return Math.max(0, Math.min(100, progress));
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const diff = date2.getTime() - date1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Determine if target is on track for a specific timeframe
 */
function isOnTrack(
  daysElapsed: number,
  daysTotal: number,
  progressPercentage: number
): boolean {
  if (daysTotal === 0) return true;

  const expectedProgress = (daysElapsed / daysTotal) * 100;
  // On track if actual progress is at least 80% of expected progress
  return progressPercentage >= expectedProgress * 0.8;
}

/**
 * Enrich target with progress calculations
 */
function enrichTargetWithProgress(target: Target): TargetWithProgress {
  const metricInfo: TargetMetric = TARGET_METRICS[target.domain];
  const now = new Date();
  const startDate = new Date(target.start_date);

  const daysElapsed = daysBetween(startDate, now);
  const daysTo3m = 90;
  const daysTo6m = 180;
  const daysTo12m = 365;

  const currentValue = target.current_value ?? target.baseline;

  const progress3m = calculateProgress(
    target.baseline,
    currentValue,
    target.target_3m,
    metricInfo.increase_is_better
  );

  const progress6m = calculateProgress(
    target.baseline,
    currentValue,
    target.target_6m,
    metricInfo.increase_is_better
  );

  const progress12m = calculateProgress(
    target.baseline,
    currentValue,
    target.target_12m,
    metricInfo.increase_is_better
  );

  // Use the most recent non-null target for overall progress
  const latestTarget = target.target_12m ?? target.target_6m ?? target.target_3m;
  const overallProgress = calculateProgress(
    target.baseline,
    currentValue,
    latestTarget,
    metricInfo.increase_is_better
  );

  // Calculate trajectory (projected value at current rate)
  let currentTrajectory: number | null = null;
  if (target.baseline !== null && currentValue !== null && daysElapsed > 0) {
    const ratePerDay = (currentValue - target.baseline) / daysElapsed;
    currentTrajectory = target.baseline + (ratePerDay * 365); // Project to 12 months
  }

  return {
    ...target,
    progress_percentage: overallProgress,
    days_elapsed: daysElapsed,
    days_remaining_3m: Math.max(0, daysTo3m - daysElapsed),
    days_remaining_6m: Math.max(0, daysTo6m - daysElapsed),
    days_remaining_12m: Math.max(0, daysTo12m - daysElapsed),
    on_track_3m: isOnTrack(daysElapsed, daysTo3m, progress3m),
    on_track_6m: isOnTrack(daysElapsed, daysTo6m, progress6m),
    on_track_12m: isOnTrack(daysElapsed, daysTo12m, progress12m),
    current_trajectory: currentTrajectory,
    metric_info: metricInfo,
  };
}

/**
 * GET /api/targets
 * Fetch all targets for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserOrNull();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const supabase = await createClient();
    const userId = user.id;

    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status') as TargetStatus | null;

    let query = supabase
      .from('targets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    } else {
      // Default to active targets only
      query = query.eq('status', 'active');
    }

    const { data: targets, error } = await query;

    if (error) {
      console.error('Fetch targets error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch targets' },
        { status: 500 }
      );
    }

    // Enrich each target with progress calculations
    const enrichedTargets: TargetWithProgress[] = (targets || []).map(enrichTargetWithProgress);

    return NextResponse.json(
      { success: true, data: enrichedTargets },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get targets error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch targets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/targets
 * Create a new fitness target
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserOrNull();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const supabase = await createClient();
    const userId = user.id;

    const body: CreateTargetInput = await request.json();

    // Validate domain
    if (!body.domain || !TARGET_METRICS[body.domain]) {
      return NextResponse.json(
        { error: 'Invalid domain' },
        { status: 400 }
      );
    }

    // Validate at least one target is set
    if (!body.target_3m && !body.target_6m && !body.target_12m) {
      return NextResponse.json(
        { error: 'At least one target (3m, 6m, or 12m) must be set' },
        { status: 400 }
      );
    }

    const metricInfo = TARGET_METRICS[body.domain];

    // Create target record
    const { data: target, error } = await supabase
      .from('targets')
      .insert({
        user_id: userId,
        domain: body.domain,
        metric_name: metricInfo.name,
        unit: metricInfo.unit,
        baseline: body.baseline,
        current_value: body.baseline, // Initialize current value to baseline
        target_3m: body.target_3m,
        target_6m: body.target_6m,
        target_12m: body.target_12m,
        start_date: new Date().toISOString().split('T')[0],
        status: 'active',
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Create target error:', error);
      return NextResponse.json(
        { error: 'Failed to create target' },
        { status: 500 }
      );
    }

    const enrichedTarget = enrichTargetWithProgress(target);

    return NextResponse.json(
      { success: true, data: enrichedTarget },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create target error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create target' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/targets
 * Update an existing target
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUserOrNull();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const supabase = await createClient();
    const userId = user.id;

    const body: UpdateTargetInput & { id: string } = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Target ID required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existingTarget, error: fetchError } = await supabase
      .from('targets')
      .select('*')
      .eq('id', body.id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingTarget) {
      return NextResponse.json(
        { error: 'Target not found or access denied' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Partial<Target> = {
      updated_at: new Date().toISOString(),
    };

    if (body.current_value !== undefined) {
      updateData.current_value = body.current_value;
    }
    if (body.target_3m !== undefined) {
      updateData.target_3m = body.target_3m;
    }
    if (body.target_6m !== undefined) {
      updateData.target_6m = body.target_6m;
    }
    if (body.target_12m !== undefined) {
      updateData.target_12m = body.target_12m;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    // Update target
    const { data: updatedTarget, error: updateError } = await supabase
      .from('targets')
      .update(updateData)
      .eq('id', body.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Update target error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update target' },
        { status: 500 }
      );
    }

    const enrichedTarget = enrichTargetWithProgress(updatedTarget);

    return NextResponse.json(
      { success: true, data: enrichedTarget },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update target error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update target' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient, DEV_USER_ID } from '@/lib/supabase/server';

/**
 * GET /api/dashboard
 *
 * Fetch aggregated dashboard data for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = DEV_USER_ID;

    // Calculate date ranges
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch all required data in parallel for performance
    const [
      latestWeight,
      todayWellness,
      recentWorkouts,
      weeklyVolume,
      activeTargets,
      latestRecovery,
      recentPRs,
    ] = await Promise.all([
      // Latest weight entry
      supabase
        .from('daily_weight')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single(),

      // Today's wellness entry
      supabase
        .from('daily_wellness')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single(),

      // Recent workouts (last 7 days)
      supabase
        .from('hevy_workouts')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', sevenDaysAgo)
        .order('start_time', { ascending: false }),

      // Weekly volume (sum of total_volume_kg from last 7 days)
      supabase
        .from('hevy_workouts')
        .select('total_volume_kg, total_sets')
        .eq('user_id', userId)
        .gte('start_time', sevenDaysAgo),

      // Active targets
      supabase
        .from('targets')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active'),

      // Latest recovery data
      supabase
        .from('whoop_recovery')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single(),

      // Recent PRs (last 30 days from functional_tests)
      supabase
        .from('functional_tests')
        .select('*')
        .eq('user_id', userId)
        .eq('is_pr', true)
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    // Calculate weekly metrics
    const totalVolume = weeklyVolume.data?.reduce(
      (sum, workout) => sum + (workout.total_volume_kg || 0),
      0
    ) || 0;

    const totalSets = weeklyVolume.data?.reduce(
      (sum, workout) => sum + (workout.total_sets || 0),
      0
    ) || 0;

    const workoutsThisWeek = recentWorkouts.data?.length || 0;

    // Calculate target progress
    const activeTargetsCount = activeTargets.data?.length || 0;
    const onTrackCount = activeTargets.data?.filter(
      (target) => {
        // Simple on-track logic: if current_value >= baseline, it's on track
        return (target.current_value || 0) >= (target.baseline || 0);
      }
    ).length || 0;

    const avgProgress = activeTargetsCount > 0
      ? Math.round((onTrackCount / activeTargetsCount) * 100)
      : 0;

    // Build dashboard response
    const dashboardData = {
      weight: {
        current: latestWeight.data?.weight_kg || null,
        bodyFat: latestWeight.data?.body_fat_pct || null,
        date: latestWeight.data?.date || null,
      },
      wellness: {
        energy: todayWellness.data?.energy || null,
        mood: todayWellness.data?.mood || null,
        soreness: todayWellness.data?.soreness || null,
        motivation: todayWellness.data?.motivation || null,
        stress: todayWellness.data?.stress || null,
      },
      training: {
        weeklyVolume: Math.round(totalVolume),
        totalSets: totalSets,
        workoutsThisWeek: workoutsThisWeek,
      },
      recovery: {
        score: latestRecovery.data?.recovery_score || null,
        status: latestRecovery.data?.traffic_light || null,
        hrv: latestRecovery.data?.hrv || null,
        rhr: latestRecovery.data?.resting_hr || null,
      },
      targets: {
        activeCount: activeTargetsCount,
        onTrack: onTrackCount,
        avgProgress: avgProgress,
      },
      recentWorkouts: recentWorkouts.data || [],
      recentPRs: recentPRs.data || [],
    };

    return NextResponse.json(
      { success: true, data: dashboardData },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get dashboard data error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

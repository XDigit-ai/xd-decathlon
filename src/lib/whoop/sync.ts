/**
 * Whoop Sync Logic
 * Syncs recovery, sleep, workout, and cycle data from the Whoop API to Supabase.
 * Handles token retrieval, refresh, data fetching, upserting, and HRV traffic-light calculation.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { createWhoopClient } from './client';
import { WHOOP_SPORT_MAP as sportMap } from './types';
import type {
  WhoopStoredTokenData,
  WhoopTokenResponse,
  WhoopRecovery,
  WhoopSleep,
  WhoopWorkout,
  WhoopCycle,
  WhoopSyncSummary,
  TrafficLight,
} from './types';

// Hardcoded dev user ID (single-user app)
const USER_ID = '0e8cc399-f19b-4dae-9eff-80e1ef81b875';

// ─── Token Management ────────────────────────────────────────────────────────

/**
 * Retrieve stored Whoop tokens from the integration_tokens table.
 * Returns null if no tokens are found.
 */
async function getStoredTokens(): Promise<WhoopStoredTokenData | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('integration_tokens')
    .select('token_data, expires_at')
    .eq('user_id', USER_ID)
    .eq('provider', 'whoop')
    .single();

  if (error || !data) {
    console.error('[Whoop Sync] No stored tokens found:', error?.message);
    return null;
  }

  const tokenData = data.token_data as WhoopStoredTokenData | null;
  if (!tokenData || !tokenData.access_token) {
    console.error('[Whoop Sync] Token data is empty or malformed');
    return null;
  }

  return tokenData;
}

/**
 * Check whether the access token is expired (or will expire within 5 minutes).
 */
function isTokenExpired(tokenData: WhoopStoredTokenData): boolean {
  if (!tokenData.expires_at) return true;

  const expiresAt = new Date(tokenData.expires_at).getTime();
  const bufferMs = 5 * 60 * 1000; // 5-minute buffer
  return Date.now() >= expiresAt - bufferMs;
}

/**
 * Refresh the Whoop access token using the stored refresh token.
 * Updates the token in the database and returns the new token data.
 */
async function refreshAccessToken(
  tokenData: WhoopStoredTokenData
): Promise<WhoopStoredTokenData> {
  console.log('[Whoop Sync] Refreshing access token...');

  const response = await fetch(
    'https://api.prod.whoop.com/oauth/oauth2/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenData.refresh_token,
        client_id: process.env.WHOOP_CLIENT_ID || '',
        client_secret: process.env.WHOOP_CLIENT_SECRET || '',
      }).toString(),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Token refresh failed (${response.status}): ${errorBody}`
    );
  }

  const tokens: WhoopTokenResponse = await response.json();

  const newExpiresAt = new Date(
    Date.now() + tokens.expires_in * 1000
  ).toISOString();

  const newTokenData: WhoopStoredTokenData = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: newExpiresAt,
    scope: tokens.scope,
    token_type: tokens.token_type,
    whoop_user_id: tokenData.whoop_user_id,
  };

  // Update the stored tokens in the database
  const supabase = createAdminClient();

  const { error: updateError } = await supabase
    .from('integration_tokens')
    .update({
      token_data: newTokenData,
      expires_at: newExpiresAt,
      scopes: tokens.scope,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', USER_ID)
    .eq('provider', 'whoop');

  if (updateError) {
    console.error('[Whoop Sync] Failed to update refreshed tokens:', updateError);
    throw new Error(`Failed to store refreshed tokens: ${updateError.message}`);
  }

  console.log('[Whoop Sync] Access token refreshed successfully');
  return newTokenData;
}

/**
 * Get a valid access token, refreshing if necessary.
 */
export async function getValidAccessToken(): Promise<string> {
  let tokenData = await getStoredTokens();

  if (!tokenData) {
    throw new Error(
      'No Whoop tokens found. Please connect your Whoop account first via /api/auth/whoop'
    );
  }

  if (isTokenExpired(tokenData)) {
    tokenData = await refreshAccessToken(tokenData);
  }

  return tokenData.access_token;
}

// ─── Date Helpers ────────────────────────────────────────────────────────────

/**
 * Calculate the date range for syncing (default: last 30 days).
 */
function getDefaultDateRange(daysBack = 30): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysBack);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Extract a date string (YYYY-MM-DD) from an ISO timestamp.
 */
function toDateString(isoTimestamp: string): string {
  return isoTimestamp.split('T')[0];
}

/**
 * Convert milliseconds to minutes (rounded to nearest integer).
 */
function milliToMinutes(milli: number): number {
  return Math.round(milli / 60000);
}

/**
 * Calculate workout duration in minutes from start and end timestamps.
 */
function calculateDurationMinutes(start: string, end: string): number {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  return Math.round((endMs - startMs) / 60000);
}

// ─── HRV Traffic Light ──────────────────────────────────────────────────────

/**
 * Calculate the traffic light status for a recovery record based on HRV.
 * Compares current HRV to the 30-day rolling average from existing database records.
 *
 * - Green:  HRV > 95% of 30-day average
 * - Yellow: HRV between 90-95% of 30-day average
 * - Red:    HRV < 90% of 30-day average
 */
async function calculateTrafficLight(
  hrvValue: number,
  date: string
): Promise<TrafficLight> {
  const supabase = createAdminClient();

  // Get the last 30 days of HRV data (excluding today) for the rolling average
  const thirtyDaysAgo = new Date(date);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentRecoveries, error } = await supabase
    .from('whoop_recovery')
    .select('hrv_rmssd')
    .eq('user_id', USER_ID)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .lt('date', date)
    .not('hrv_rmssd', 'is', null)
    .order('date', { ascending: false });

  if (error) {
    console.warn('[Whoop Sync] Failed to fetch HRV history for traffic light:', error.message);
    // Default to yellow if we cannot compute
    return 'yellow';
  }

  // If we have fewer than 5 data points, default to yellow (not enough data)
  if (!recentRecoveries || recentRecoveries.length < 5) {
    return 'yellow';
  }

  const hrvValues = recentRecoveries.map((r) => Number(r.hrv_rmssd));
  const avgHrv = hrvValues.reduce((sum, v) => sum + v, 0) / hrvValues.length;

  if (avgHrv === 0) return 'yellow';

  const ratio = hrvValue / avgHrv;

  if (ratio > 0.95) return 'green';
  if (ratio >= 0.90) return 'yellow';
  return 'red';
}

// ─── Data Upsert Functions ───────────────────────────────────────────────────

/**
 * Upsert recovery records into whoop_recovery table.
 */
async function upsertRecoveryData(
  recoveries: WhoopRecovery[]
): Promise<number> {
  const supabase = createAdminClient();
  let synced = 0;

  for (const recovery of recoveries) {
    if (recovery.score_state !== 'SCORED' || !recovery.score) {
      continue;
    }

    const score = recovery.score;
    const date = toDateString(recovery.created_at);

    const trafficLight = await calculateTrafficLight(
      score.hrv_rmssd_milli,
      date
    );

    const { error } = await supabase.from('whoop_recovery').upsert(
      {
        user_id: USER_ID,
        whoop_id: String(recovery.cycle_id),
        date,
        recovery_score: score.recovery_score,
        hrv_rmssd: score.hrv_rmssd_milli,
        resting_hr: score.resting_heart_rate,
        spo2_pct: score.spo2_percentage ?? null,
        skin_temp_celsius: score.skin_temp_celsius ?? null,
        traffic_light: trafficLight,
        raw_data: recovery,
      },
      { onConflict: 'user_id,date' }
    );

    if (error) {
      console.error(
        `[Whoop Sync] Recovery upsert error for cycle ${recovery.cycle_id}:`,
        error.message
      );
    } else {
      synced++;
    }
  }

  return synced;
}

/**
 * Upsert sleep records into whoop_sleep table.
 */
async function upsertSleepData(sleepRecords: WhoopSleep[]): Promise<number> {
  const supabase = createAdminClient();
  let synced = 0;

  for (const sleep of sleepRecords) {
    // Skip naps and unscored sleeps
    if (sleep.nap || sleep.score_state !== 'SCORED' || !sleep.score) {
      continue;
    }

    const score = sleep.score;
    const stages = score.stage_summary;
    const date = toDateString(sleep.start);

    // Total in-bed time (includes all stages + awake time)
    const totalSleepMilli = stages.total_in_bed_time_milli;

    const { error } = await supabase.from('whoop_sleep').upsert(
      {
        user_id: USER_ID,
        whoop_id: String(sleep.id),
        date,
        total_duration_minutes: milliToMinutes(totalSleepMilli),
        rem_minutes: milliToMinutes(stages.total_rem_sleep_time_milli),
        deep_minutes: milliToMinutes(stages.total_slow_wave_sleep_time_milli),
        light_minutes: milliToMinutes(stages.total_light_sleep_time_milli),
        awake_minutes: milliToMinutes(stages.total_awake_time_milli),
        sleep_performance: score.sleep_performance_percentage,
        respiratory_rate: score.respiratory_rate,
        raw_data: sleep,
      },
      { onConflict: 'user_id,date' }
    );

    if (error) {
      console.error(
        `[Whoop Sync] Sleep upsert error for sleep ${sleep.id}:`,
        error.message
      );
    } else {
      synced++;
    }
  }

  return synced;
}

/**
 * Upsert workout records into whoop_workouts table.
 */
async function upsertWorkoutData(workouts: WhoopWorkout[]): Promise<number> {
  const supabase = createAdminClient();
  let synced = 0;

  for (const workout of workouts) {
    if (workout.score_state !== 'SCORED' || !workout.score) {
      continue;
    }

    const score = workout.score;
    const zones = score.zone_durations || score.zone_duration;
    const date = toDateString(workout.start);
    const durationMinutes = calculateDurationMinutes(workout.start, workout.end);
    const sportName = workout.sport_name || (workout.sport_id ? (sportMap[workout.sport_id] || `Sport ${workout.sport_id}`) : 'Unknown');

    const { error } = await supabase.from('whoop_workouts').upsert(
      {
        user_id: USER_ID,
        whoop_id: String(workout.id),
        date,
        sport_name: sportName,
        duration_minutes: durationMinutes > 0 ? durationMinutes : null,
        strain: score.strain,
        avg_hr: score.average_heart_rate,
        max_hr: score.max_heart_rate,
        kilojoules: score.kilojoule,
        zone1_minutes: zones ? milliToMinutes(zones.zone_one_milli) : null,
        zone2_minutes: zones ? milliToMinutes(zones.zone_two_milli) : null,
        zone3_minutes: zones ? milliToMinutes(zones.zone_three_milli) : null,
        zone4_minutes: zones ? milliToMinutes(zones.zone_four_milli) : null,
        zone5_minutes: zones ? milliToMinutes(zones.zone_five_milli) : null,
        raw_data: workout,
      },
      { onConflict: 'whoop_id' }
    );

    if (error) {
      console.error(
        `[Whoop Sync] Workout upsert error for workout ${workout.id}:`,
        error.message
      );
    } else {
      synced++;
    }
  }

  return synced;
}

/**
 * Upsert cycle records into whoop_cycles table.
 */
async function upsertCycleData(cycles: WhoopCycle[]): Promise<number> {
  const supabase = createAdminClient();
  let synced = 0;

  for (const cycle of cycles) {
    if (cycle.score_state !== 'SCORED' || !cycle.score) {
      continue;
    }

    const score = cycle.score;
    const date = toDateString(cycle.start);

    const { error } = await supabase.from('whoop_cycles').upsert(
      {
        user_id: USER_ID,
        whoop_id: String(cycle.id),
        date,
        strain: score.strain,
        kilojoules: score.kilojoule,
        avg_hr: score.average_heart_rate,
        max_hr: score.max_heart_rate,
        raw_data: cycle,
      },
      { onConflict: 'user_id,date' }
    );

    if (error) {
      console.error(
        `[Whoop Sync] Cycle upsert error for cycle ${cycle.id}:`,
        error.message
      );
    } else {
      synced++;
    }
  }

  return synced;
}

// ─── Main Sync Function ─────────────────────────────────────────────────────

/**
 * Full sync of Whoop data for the dev user.
 *
 * 1. Retrieves and validates stored tokens (refreshes if expired)
 * 2. Fetches recovery, sleep, workout, and cycle data for the last N days
 * 3. Upserts all data into the corresponding Supabase tables
 * 4. Calculates HRV-based traffic light status for each recovery record
 * 5. Returns a summary of the sync operation
 *
 * @param daysBack Number of days to look back (default: 30)
 */
export async function syncWhoopData(
  daysBack = 30
): Promise<WhoopSyncSummary> {
  const startTime = Date.now();
  const summary: WhoopSyncSummary = {
    success: false,
    recovery_synced: 0,
    sleep_synced: 0,
    workouts_synced: 0,
    cycles_synced: 0,
    errors: [],
    started_at: new Date().toISOString(),
    completed_at: '',
    duration_ms: 0,
  };

  try {
    // Step 1: Get a valid access token (refreshing if needed)
    const accessToken = await getValidAccessToken();
    const client = createWhoopClient(accessToken);

    const { start, end } = getDefaultDateRange(daysBack);

    console.log(
      `[Whoop Sync] Starting sync for last ${daysBack} days (${start} to ${end})`
    );

    // Step 2: Fetch all data in parallel
    const [recoveries, sleepRecords, workouts, cycles] = await Promise.all([
      client
        .getAllRecovery({ start, end }, (n) =>
          console.log(`[Whoop Sync] Fetched ${n} recovery records...`)
        )
        .catch((err) => {
          summary.errors.push(`Recovery fetch failed: ${err.message}`);
          console.error('[Whoop Sync] Recovery fetch error:', err);
          return [] as WhoopRecovery[];
        }),

      client
        .getAllSleep({ start, end }, (n) =>
          console.log(`[Whoop Sync] Fetched ${n} sleep records...`)
        )
        .catch((err) => {
          summary.errors.push(`Sleep fetch failed: ${err.message}`);
          console.error('[Whoop Sync] Sleep fetch error:', err);
          return [] as WhoopSleep[];
        }),

      client
        .getAllWorkouts({ start, end }, (n) =>
          console.log(`[Whoop Sync] Fetched ${n} workout records...`)
        )
        .catch((err) => {
          summary.errors.push(`Workout fetch failed: ${err.message}`);
          console.error('[Whoop Sync] Workout fetch error:', err);
          return [] as WhoopWorkout[];
        }),

      client
        .getAllCycles({ start, end }, (n) =>
          console.log(`[Whoop Sync] Fetched ${n} cycle records...`)
        )
        .catch((err) => {
          summary.errors.push(`Cycle fetch failed: ${err.message}`);
          console.error('[Whoop Sync] Cycle fetch error:', err);
          return [] as WhoopCycle[];
        }),
    ]);

    console.log(
      `[Whoop Sync] Fetched: ${recoveries.length} recoveries, ${sleepRecords.length} sleeps, ${workouts.length} workouts, ${cycles.length} cycles`
    );

    // Step 3: Upsert data into Supabase
    // Process recovery first so HRV history is available for traffic light calculations
    summary.recovery_synced = await upsertRecoveryData(recoveries);
    summary.sleep_synced = await upsertSleepData(sleepRecords);
    summary.workouts_synced = await upsertWorkoutData(workouts);
    summary.cycles_synced = await upsertCycleData(cycles);

    summary.success = summary.errors.length === 0;
    summary.completed_at = new Date().toISOString();
    summary.duration_ms = Date.now() - startTime;

    console.log('[Whoop Sync] Sync completed:', {
      recovery: summary.recovery_synced,
      sleep: summary.sleep_synced,
      workouts: summary.workouts_synced,
      cycles: summary.cycles_synced,
      errors: summary.errors.length,
      duration: `${summary.duration_ms}ms`,
    });

    return summary;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : 'Unknown error';
    summary.errors.push(`Sync failed: ${errorMsg}`);
    summary.completed_at = new Date().toISOString();
    summary.duration_ms = Date.now() - startTime;

    console.error('[Whoop Sync] Sync failed:', error);
    return summary;
  }
}

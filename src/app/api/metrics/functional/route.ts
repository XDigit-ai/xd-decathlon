import { NextRequest, NextResponse } from 'next/server';
import { createClient, DEV_USER_ID } from '@/lib/supabase/server';

// Type definitions for functional tests
const VALID_TEST_TYPES = [
  'dead_hang',
  'farmer_walk',
  'plank',
  'wall_sit',
  'pull_ups',
  'balance_open_l',
  'balance_open_r',
  'balance_closed_l',
  'balance_closed_r',
  'floor_getup',
  'deadlift_reps',
  'grip_l',
  'grip_r',
  'mile_run',
] as const;

type TestType = typeof VALID_TEST_TYPES[number];

// Map test types to their units
const TEST_TYPE_UNITS: Record<TestType, string> = {
  dead_hang: 'seconds',
  farmer_walk: 'seconds',
  plank: 'seconds',
  wall_sit: 'seconds',
  pull_ups: 'reps',
  balance_open_l: 'seconds',
  balance_open_r: 'seconds',
  balance_closed_l: 'seconds',
  balance_closed_r: 'seconds',
  floor_getup: 'arms',
  deadlift_reps: 'reps',
  grip_l: 'kg',
  grip_r: 'kg',
  mile_run: 'seconds',
};

interface FunctionalTest {
  id: string;
  user_id: string;
  date: string;
  test_type: TestType;
  value: number;
  unit: string;
  load_kg: number | null;
  notes: string | null;
  is_pr: boolean;
  created_at: string;
}

/**
 * GET /api/metrics/functional
 *
 * Fetch functional fitness test results (Peter Attia benchmarks)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = DEV_USER_ID;

    const searchParams = request.nextUrl.searchParams;
    const testType = searchParams.get('type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Build query
    let query = supabase
      .from('functional_tests')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    // Apply filters
    if (testType) {
      query = query.eq('test_type', testType);
    }
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: tests, error } = await query;

    if (error) {
      console.error('Error fetching functional tests:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tests' },
        { status: 500 }
      );
    }

    // Group by test type and calculate latest + best for each
    const groupedByType: Record<string, {
      latest: FunctionalTest | null;
      best: FunctionalTest | null;
      all: FunctionalTest[];
    }> = {};

    // Initialize all test types
    VALID_TEST_TYPES.forEach(type => {
      groupedByType[type] = {
        latest: null,
        best: null,
        all: []
      };
    });

    // Group and find latest/best
    tests?.forEach((test: FunctionalTest) => {
      const group = groupedByType[test.test_type];
      if (!group) return;

      group.all.push(test);

      // Update latest (already sorted by date descending)
      if (!group.latest) {
        group.latest = test;
      }

      // Update best (depends on test type)
      if (!group.best) {
        group.best = test;
      } else {
        // For mile_run and floor_getup, LOWER is better
        if (test.test_type === 'mile_run' || test.test_type === 'floor_getup') {
          if (test.value < group.best.value) {
            group.best = test;
          }
        } else {
          // For all other tests, HIGHER is better
          if (test.value > group.best.value) {
            group.best = test;
          }
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          grouped: groupedByType,
          all: tests
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get functional metrics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/metrics/functional
 *
 * Record a new functional fitness test result
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = DEV_USER_ID;

    const body = await request.json();
    const { test_type, value, date, load_kg, notes } = body;

    // Validate test_type
    if (!VALID_TEST_TYPES.includes(test_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid test type' },
        { status: 400 }
      );
    }

    // Validate value
    if (typeof value !== 'number' || isNaN(value)) {
      return NextResponse.json(
        { success: false, error: 'Invalid value' },
        { status: 400 }
      );
    }

    // Auto-set unit based on test type
    const unit = TEST_TYPE_UNITS[test_type as TestType];

    // Check if this is a PR by comparing to previous best
    let isPR = false;

    // Get all previous tests of this type
    const { data: previousTests } = await supabase
      .from('functional_tests')
      .select('value')
      .eq('user_id', userId)
      .eq('test_type', test_type)
      .order('value', { ascending: test_type === 'mile_run' || test_type === 'floor_getup' });

    if (previousTests && previousTests.length > 0) {
      const bestPreviousValue = previousTests[0].value;

      // For mile_run and floor_getup, lower is better
      if (test_type === 'mile_run' || test_type === 'floor_getup') {
        isPR = value < bestPreviousValue;
      } else {
        // For all other tests, higher is better
        isPR = value > bestPreviousValue;
      }
    } else {
      // First test of this type is always a PR
      isPR = true;
    }

    // If this is a new PR, mark all previous tests as not PR
    if (isPR) {
      await supabase
        .from('functional_tests')
        .update({ is_pr: false })
        .eq('user_id', userId)
        .eq('test_type', test_type);
    }

    // Insert new test result
    const { data: newTest, error: insertError } = await supabase
      .from('functional_tests')
      .insert({
        user_id: userId,
        test_type,
        value,
        unit,
        date: date || new Date().toISOString().split('T')[0],
        load_kg: load_kg || null,
        notes: notes || null,
        is_pr: isPR,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting functional test:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to record test' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newTest,
        message: isPR ? 'New personal record!' : 'Test result recorded'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create functional metric error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record test' },
      { status: 500 }
    );
  }
}

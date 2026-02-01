import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/supabase/auth';

export type Vo2Source = 'lab_test' | 'watch' | 'whoop' | 'calculated' | 'manual';

interface Vo2Entry {
  id: string;
  user_id: string;
  date: string;
  value: number;
  source: Vo2Source;
  notes: string | null;
  created_at: string;
}

/**
 * GET /api/metrics/vo2
 * Fetch VO2 max entries for the authenticated user
 * Query params: limit (default 30), offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const { data, error } = await supabase
      .from('vo2max_entries')
      .select('id, user_id, date, value, source, notes, created_at')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[VO2 API] Fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch VO2 max entries' },
        { status: 500 }
      );
    }

    // Get latest and calculate trend
    const latest = data?.[0] ?? null;
    const previous = data?.[1] ?? null;
    const trend = latest && previous ? latest.value - previous.value : null;

    return NextResponse.json({
      entries: data as Vo2Entry[],
      latest,
      trend,
      count: data?.length ?? 0,
    });
  } catch (error) {
    console.error('[VO2 API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/metrics/vo2
 * Create a new VO2 max entry
 * Body: { date, value, source?, notes? }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const supabase = await createClient();

    const body = await request.json();
    const { date, value, source = 'manual', notes } = body;

    // Validate required fields
    if (!date || value === undefined) {
      return NextResponse.json(
        { error: 'Date and value are required' },
        { status: 400 }
      );
    }

    // Validate value range (realistic VO2 max: 10-100 ml/kg/min)
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0 || numValue >= 100) {
      return NextResponse.json(
        { error: 'VO2 max value must be between 0 and 100 ml/kg/min' },
        { status: 400 }
      );
    }

    // Validate source
    const validSources: Vo2Source[] = ['lab_test', 'watch', 'whoop', 'calculated', 'manual'];
    if (!validSources.includes(source)) {
      return NextResponse.json(
        { error: `Invalid source. Must be one of: ${validSources.join(', ')}` },
        { status: 400 }
      );
    }

    // Upsert (update if same date exists)
    const { data, error } = await supabase
      .from('vo2max_entries')
      .upsert(
        {
          user_id: user.id,
          date,
          value: numValue,
          source,
          notes: notes || null,
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (error) {
      console.error('[VO2 API] Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save VO2 max entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (error) {
    console.error('[VO2 API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/metrics/vo2?id=<entry_id>
 * Delete a VO2 max entry
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('vo2max_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[VO2 API] Delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete VO2 max entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[VO2 API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

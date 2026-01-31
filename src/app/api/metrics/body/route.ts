import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = searchParams.get('limit');

    const userId = session.user.id;

    if (type === 'weight') {
      let query = supabase
        .from('daily_weight')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (from) {
        query = query.gte('date', from);
      }
      if (to) {
        query = query.lte('date', to);
      }
      if (limit) {
        query = query.limit(parseInt(limit, 10));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fetch weight error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch weight data' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, data },
        { status: 200 }
      );
    }

    if (type === 'measurements') {
      let query = supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (from) {
        query = query.gte('date', from);
      }
      if (to) {
        query = query.lte('date', to);
      }
      if (limit) {
        query = query.limit(parseInt(limit, 10));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fetch measurements error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch measurements' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, data },
        { status: 200 }
      );
    }

    if (type === 'dexa') {
      let query = supabase
        .from('dexa_scans')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (from) {
        query = query.gte('date', from);
      }
      if (to) {
        query = query.lte('date', to);
      }
      if (limit) {
        query = query.limit(parseInt(limit, 10));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fetch DEXA scans error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch DEXA scans' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, data },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Get body metrics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Type is required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    if (type === 'weight') {
      if (!data.date || !data.weight_kg) {
        return NextResponse.json(
          { success: false, error: 'Date and weight_kg are required' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('daily_weight')
        .insert({
          user_id: userId,
          date: data.date,
          weight_kg: data.weight_kg,
          body_fat_pct: data.body_fat_pct || null,
          notes: data.notes || null,
          source: data.source || 'manual',
        });

      if (error) {
        console.error('Insert weight error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to create weight entry' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: 'Weight entry created' },
        { status: 201 }
      );
    }

    if (type === 'measurements') {
      if (!data.date) {
        return NextResponse.json(
          { success: false, error: 'Date is required' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('body_measurements')
        .insert({
          user_id: userId,
          date: data.date,
          chest_cm: data.chest_cm || null,
          waist_cm: data.waist_cm || null,
          hips_cm: data.hips_cm || null,
          left_arm_cm: data.left_arm_cm || null,
          right_arm_cm: data.right_arm_cm || null,
          left_thigh_cm: data.left_thigh_cm || null,
          right_thigh_cm: data.right_thigh_cm || null,
          left_calf_cm: data.left_calf_cm || null,
          right_calf_cm: data.right_calf_cm || null,
          neck_cm: data.neck_cm || null,
          shoulders_cm: data.shoulders_cm || null,
          notes: data.notes || null,
        });

      if (error) {
        console.error('Insert measurements error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to create measurements entry' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: 'Measurements entry created' },
        { status: 201 }
      );
    }

    if (type === 'dexa') {
      if (!data.date || !data.total_body_fat_pct) {
        return NextResponse.json(
          { success: false, error: 'Date and total_body_fat_pct are required' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('dexa_scans')
        .insert({
          user_id: userId,
          date: data.date,
          total_body_fat_pct: data.total_body_fat_pct,
          lean_mass_kg: data.lean_mass_kg || null,
          fat_mass_kg: data.fat_mass_kg || null,
          bone_mineral_density: data.bone_mineral_density || null,
          visceral_fat_area_cm2: data.visceral_fat_area_cm2 || null,
          android_fat_pct: data.android_fat_pct || null,
          gynoid_fat_pct: data.gynoid_fat_pct || null,
          appendicular_lean_mass_kg: data.appendicular_lean_mass_kg || null,
          notes: data.notes || null,
          scan_provider: data.scan_provider || null,
        });

      if (error) {
        console.error('Insert DEXA scan error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to create DEXA scan entry' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: 'DEXA scan entry created' },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Create body metric error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create metric' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'Type and ID are required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    if (type === 'weight') {
      const { error } = await supabase
        .from('daily_weight')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Delete weight error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to delete weight entry' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: 'Weight entry deleted' },
        { status: 200 }
      );
    }

    if (type === 'measurements') {
      const { error } = await supabase
        .from('body_measurements')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Delete measurements error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to delete measurements entry' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: 'Measurements entry deleted' },
        { status: 200 }
      );
    }

    if (type === 'dexa') {
      const { error } = await supabase
        .from('dexa_scans')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Delete DEXA scan error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to delete DEXA scan entry' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: 'DEXA scan entry deleted' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Delete body metric error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete metric' },
      { status: 500 }
    );
  }
}

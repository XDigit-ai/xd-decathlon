import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthUserOrNull } from '@/lib/supabase/auth';

/**
 * POST /api/metrics/manual
 *
 * Quick-add manual entry for weight, wellness, or VO2 max metrics
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserOrNull();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const supabase = await createClient();
    const userId = user.id;
    const body = await request.json();

    const { type, ...data } = body;

    // Validate type
    const validTypes = ['weight', 'wellness', 'vo2max'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid or missing type. Must be one of: weight, wellness, vo2max' },
        { status: 400 }
      );
    }

    // Handle different entry types
    if (type === 'weight') {
      // Validate weight data
      const { weight_kg, body_fat_pct, date } = data;

      if (!weight_kg || isNaN(parseFloat(weight_kg))) {
        return NextResponse.json(
          { error: 'weight_kg is required and must be a number' },
          { status: 400 }
        );
      }

      const entryDate = date || new Date().toISOString().split('T')[0];

      // Insert or update weight entry
      const { data: weightEntry, error } = await supabase
        .from('daily_weight')
        .upsert({
          user_id: userId,
          date: entryDate,
          weight_kg: parseFloat(weight_kg),
          body_fat_pct: body_fat_pct ? parseFloat(body_fat_pct) : null,
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) {
        console.error('Weight insert error:', error);
        return NextResponse.json(
          { error: 'Failed to save weight entry' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, data: weightEntry },
        { status: 201 }
      );
    }

    if (type === 'wellness') {
      // Validate wellness data
      const { energy, mood, soreness, motivation, stress, notes, date } = data;

      // At least one wellness metric should be provided
      if (!energy && !mood && !soreness && !motivation && !stress) {
        return NextResponse.json(
          { error: 'At least one wellness metric is required' },
          { status: 400 }
        );
      }

      // Validate ranges (1-5)
      const validateRange = (value: any, name: string) => {
        if (value !== undefined && value !== null) {
          const num = parseInt(value);
          if (isNaN(num) || num < 1 || num > 5) {
            throw new Error(`${name} must be between 1 and 5`);
          }
          return num;
        }
        return null;
      };

      try {
        const entryDate = date || new Date().toISOString().split('T')[0];

        const wellnessData: any = {
          user_id: userId,
          date: entryDate,
        };

        if (energy) wellnessData.energy = validateRange(energy, 'energy');
        if (mood) wellnessData.mood = validateRange(mood, 'mood');
        if (soreness) wellnessData.soreness = validateRange(soreness, 'soreness');
        if (motivation) wellnessData.motivation = validateRange(motivation, 'motivation');
        if (stress) wellnessData.stress = validateRange(stress, 'stress');
        if (notes) wellnessData.notes = notes;

        // Insert or update wellness entry
        const { data: wellnessEntry, error } = await supabase
          .from('daily_wellness')
          .upsert(wellnessData, {
            onConflict: 'user_id,date'
          })
          .select()
          .single();

        if (error) {
          console.error('Wellness insert error:', error);
          return NextResponse.json(
            { error: 'Failed to save wellness entry' },
            { status: 500 }
          );
        }

        return NextResponse.json(
          { success: true, data: wellnessEntry },
          { status: 201 }
        );
      } catch (validationError: any) {
        return NextResponse.json(
          { error: validationError.message },
          { status: 400 }
        );
      }
    }

    if (type === 'vo2max') {
      // Store VO2 max in functional_tests table
      const { value, date } = data;

      if (!value || isNaN(parseFloat(value))) {
        return NextResponse.json(
          { error: 'value is required and must be a number' },
          { status: 400 }
        );
      }

      const entryDate = date || new Date().toISOString();

      const { data: vo2maxEntry, error } = await supabase
        .from('functional_tests')
        .insert({
          user_id: userId,
          test_type: 'vo2_max',
          value: parseFloat(value),
          unit: 'ml/kg/min',
          created_at: entryDate,
          is_pr: false, // Can be calculated later by comparing with previous entries
        })
        .select()
        .single();

      if (error) {
        console.error('VO2 max insert error:', error);
        return NextResponse.json(
          { error: 'Failed to save VO2 max entry' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, data: vo2maxEntry },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: 'Unknown type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Create manual entry error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}

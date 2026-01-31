import { NextRequest, NextResponse } from 'next/server';
import { createClient, DEV_USER_ID } from '@/lib/supabase/server';

/**
 * GET /api/reviews
 *
 * Fetch reviews for the authenticated user
 * TODO: Get user from session
 * TODO: Support filtering by type (weekly, monthly, quarterly)
 * TODO: Support filtering by status (draft, completed)
 * TODO: Fetch reviews from Supabase ordered by date (newest first)
 * TODO: Return review list with metadata
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // TODO: Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // weekly, monthly, quarterly
    const status = searchParams.get('status'); // draft, completed

    // TODO: Fetch reviews from database with filters

    const reviews: unknown[] = [];

    return NextResponse.json(
      { success: true, data: reviews },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 *
 * Create a new review
 * TODO: Validate request body (type, period data, content)
 * TODO: Get user from session
 * TODO: For weekly: validate weekStart, weekEnd
 * TODO: For monthly: validate month, year
 * TODO: For quarterly: validate quarter, year
 * TODO: Initialize review with default structure based on type
 * TODO: Insert into reviews table
 * TODO: Return created review with ID
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();

    // TODO: Validate input based on review type
    const validTypes = ['weekly', 'monthly', 'quarterly'];

    if (!body.type || !validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid or missing type' },
        { status: 400 }
      );
    }

    // TODO: Initialize review structure based on type
    // TODO: Auto-populate metrics if data is available
    // TODO: Insert into reviews table

    return NextResponse.json(
      { success: true, message: 'Review created' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reviews
 *
 * Update an existing review
 * TODO: Validate request body (id, updates)
 * TODO: Get user from session
 * TODO: Verify user owns the review
 * TODO: Update review in Supabase
 * TODO: Support partial updates (only changed fields)
 * TODO: Support changing status (draft -> completed)
 * TODO: Return updated review
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Review ID required' },
        { status: 400 }
      );
    }

    // TODO: Verify ownership
    // TODO: Update review fields
    // TODO: If status changes to completed, set completedAt timestamp

    return NextResponse.json(
      { success: true, message: 'Review updated' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

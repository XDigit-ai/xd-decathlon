import { NextRequest, NextResponse } from 'next/server';
import { createClient, DEV_USER_ID } from '@/lib/supabase/server';

/**
 * GET /api/metrics/photos
 *
 * Fetch progress photos for the authenticated user
 * TODO: Get user from session
 * TODO: Fetch photo metadata from Supabase
 * TODO: Support filtering by angle (front, back, side), date range
 * TODO: Generate signed URLs for photos from Supabase Storage
 * TODO: Return photos ordered by date (newest first)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // TODO: Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const angle = searchParams.get('angle'); // front, back, side

    // TODO: Fetch photo records from database
    // TODO: Generate signed URLs from Supabase Storage

    const photos: unknown[] = [];

    return NextResponse.json(
      { success: true, data: photos },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get progress photos error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/metrics/photos
 *
 * Upload new progress photos
 * TODO: Get user from session
 * TODO: Validate uploaded file (image type, size limit)
 * TODO: Generate unique filename with user ID and timestamp
 * TODO: Upload to Supabase Storage (bucket: progress-photos)
 * TODO: Create metadata record in database (angle, date, notes)
 * TODO: Return photo record with URL
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const angle = formData.get('angle') as string; // front, back, side
    const notes = formData.get('notes') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // TODO: Validate file type (image/jpeg, image/png, image/webp)
    // TODO: Validate file size (e.g., max 10MB)

    // TODO: Generate unique filename
    // Format: userId/YYYY-MM-DD/angle_timestamp.ext

    // TODO: Upload to Supabase Storage
    // TODO: Create metadata record in progress_photos table
    // TODO: Generate signed URL for response

    return NextResponse.json(
      { success: true, message: 'Photo uploaded' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload photo error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

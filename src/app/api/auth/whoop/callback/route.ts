import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/auth/whoop/callback
 *
 * OAuth callback handler for Whoop
 * TODO: Verify state parameter matches stored value (CSRF protection)
 * TODO: Exchange authorization code for access token and refresh token
 * TODO: Store tokens securely in Supabase (encrypted)
 * TODO: Fetch and store user's Whoop profile
 * TODO: Set up webhook subscription for automatic data sync
 * TODO: Redirect to settings page with success message
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Whoop OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=oauth_failed`
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing code or state parameter' },
        { status: 400 }
      );
    }

    // TODO: Verify state parameter

    // TODO: Exchange code for tokens
    const tokenResponse = await fetch('https://api.whoop.com/oauth/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.WHOOP_CLIENT_ID,
        client_secret: process.env.WHOOP_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/whoop/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    const supabase = await createClient();

    // TODO: Get current user
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login`
      );
    }

    // TODO: Store tokens in Supabase (encrypted)
    // TODO: Set up Whoop webhook subscription

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=whoop_connected`
    );
  } catch (error) {
    console.error('Whoop callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=oauth_callback_failed`
    );
  }
}

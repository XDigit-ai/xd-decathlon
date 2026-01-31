import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/whoop
 *
 * Initiates the Whoop OAuth 2.0 authorization flow.
 * Generates a CSRF state parameter, stores it in an HTTP-only cookie,
 * and redirects the user to Whoop's authorization page.
 *
 * Required scopes: read:recovery read:sleep read:workout read:cycles read:profile
 */
export async function GET(request: NextRequest) {
  try {
    const whoopClientId = process.env.WHOOP_CLIENT_ID;
    const redirectUri =
      process.env.NEXT_PUBLIC_WHOOP_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/whoop/callback`;

    if (!whoopClientId) {
      return NextResponse.json(
        { error: 'Whoop OAuth not configured. Missing WHOOP_CLIENT_ID.' },
        { status: 500 }
      );
    }

    // Generate a cryptographically random state parameter for CSRF protection
    const state = crypto.randomUUID();

    // Store state in an HTTP-only cookie so we can verify it in the callback
    const cookieStore = await cookies();
    cookieStore.set('whoop_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    const scopes = [
      'read:recovery',
      'read:sleep',
      'read:workout',
      'read:cycles',
      'read:profile',
    ].join(' ');

    const authUrl = new URL('https://api.prod.whoop.com/oauth/oauth2/auth');
    authUrl.searchParams.set('client_id', whoopClientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('[Whoop OAuth] Initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Whoop OAuth flow' },
      { status: 500 }
    );
  }
}

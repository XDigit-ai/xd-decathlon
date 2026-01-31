import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/whoop
 *
 * Initiates Whoop OAuth flow
 * TODO: Generate OAuth state parameter for CSRF protection
 * TODO: Store state in session/cookie
 * TODO: Redirect to Whoop authorization URL with client_id, redirect_uri, scope
 * TODO: Scopes needed: read:recovery, read:sleep, read:workout, read:profile
 */
export async function GET(request: NextRequest) {
  try {
    const whoopClientId = process.env.WHOOP_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/whoop/callback`;

    if (!whoopClientId) {
      return NextResponse.json(
        { error: 'Whoop OAuth not configured' },
        { status: 500 }
      );
    }

    // TODO: Generate and store state parameter for security
    const state = crypto.randomUUID();

    // TODO: Store state in session or encrypted cookie

    const scopes = [
      'read:recovery',
      'read:sleep',
      'read:workout',
      'read:profile',
    ].join(' ');

    const authUrl = new URL('https://api.whoop.com/oauth/oauth2/auth');
    authUrl.searchParams.set('client_id', whoopClientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Whoop OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth' },
      { status: 500 }
    );
  }
}

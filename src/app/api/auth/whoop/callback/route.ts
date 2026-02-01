import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { WhoopTokenResponse, WhoopStoredTokenData } from '@/lib/whoop/types';

/**
 * GET /api/auth/whoop/callback
 *
 * OAuth 2.0 callback handler for Whoop.
 * 1. Verifies the state parameter against the stored cookie (CSRF protection)
 * 2. Exchanges the authorization code for access and refresh tokens
 * 3. Stores tokens as plain text in the integration_tokens table via admin client
 * 4. Optionally fetches the user's Whoop profile
 * 5. Redirects to /settings with a success or error query parameter
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Handle OAuth errors from Whoop
    if (error) {
      console.error('[Whoop Callback] OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        `${appUrl}/settings?error=oauth_failed&message=${encodeURIComponent(errorDescription || error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${appUrl}/settings?error=missing_params`
      );
    }

    // Verify state parameter to protect against CSRF
    const cookieStore = await cookies();
    const storedState = cookieStore.get('whoop_oauth_state')?.value;

    if (!storedState || storedState !== state) {
      console.error('[Whoop Callback] State mismatch. Expected:', storedState, 'Got:', state);
      return NextResponse.redirect(
        `${appUrl}/settings?error=state_mismatch`
      );
    }

    // Clear the state cookie now that it has been verified
    cookieStore.delete('whoop_oauth_state');

    // Resolve authenticated user from session
    const supabaseSession = await createClient();
    const { data: { user } } = await supabaseSession.auth.getUser();
    if (!user) {
      return NextResponse.redirect(`${appUrl}/login`);
    }

    // Exchange authorization code for tokens
    const redirectUri =
      process.env.NEXT_PUBLIC_WHOOP_REDIRECT_URI ||
      `${appUrl}/api/auth/whoop/callback`;

    const tokenResponse = await fetch(
      'https://api.prod.whoop.com/oauth/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: process.env.WHOOP_CLIENT_ID || '',
          client_secret: process.env.WHOOP_CLIENT_SECRET || '',
          redirect_uri: redirectUri,
        }).toString(),
      }
    );

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error(
        '[Whoop Callback] Token exchange failed:',
        tokenResponse.status,
        errorBody
      );
      return NextResponse.redirect(
        `${appUrl}/settings?error=token_exchange_failed`
      );
    }

    const tokens: WhoopTokenResponse = await tokenResponse.json();

    // Calculate token expiration timestamp
    const expiresAt = new Date(
      Date.now() + tokens.expires_in * 1000
    ).toISOString();

    // Build the token data payload for plain text storage
    const tokenData: WhoopStoredTokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      scope: tokens.scope,
      token_type: tokens.token_type,
    };

    // Optionally fetch the Whoop user profile to store the whoop_user_id
    try {
      const profileResponse = await fetch(
        'https://api.prod.whoop.com/developer/v2/user/profile/basic',
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        tokenData.whoop_user_id = profile.user_id;
      }
    } catch (profileError) {
      // Non-critical: continue without profile data
      console.warn('[Whoop Callback] Failed to fetch profile:', profileError);
    }

    // Store tokens in Supabase using admin client (bypasses RLS)
    const supabase = createAdminClient();

    const { error: upsertError } = await supabase
      .from('integration_tokens')
      .upsert(
        {
          user_id: user.id,
          provider: 'whoop',
          token_data: tokenData,
          token_type: tokens.token_type,
          expires_at: expiresAt,
          scopes: tokens.scope,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,provider',
        }
      );

    if (upsertError) {
      console.error('[Whoop Callback] Token storage error:', upsertError);
      return NextResponse.redirect(
        `${appUrl}/settings?error=token_storage_failed`
      );
    }

    console.log('[Whoop Callback] Tokens stored successfully for user:', user.id);

    return NextResponse.redirect(
      `${appUrl}/settings?success=whoop_connected`
    );
  } catch (error) {
    console.error('[Whoop Callback] Unexpected error:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${appUrl}/settings?error=oauth_callback_failed`
    );
  }
}

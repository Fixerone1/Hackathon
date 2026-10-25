import { NextResponse } from 'next/server';
import { encryptGoogleToken, getServiceClient, verifyGoogleOAuthState } from '@/lib/server/integrations';

export const runtime = 'nodejs';

function callbackCookie(request: Request): string | null {
  const value = request.headers.get('cookie')?.split(';').map((part) => part.trim())
    .find((part) => part.startsWith('google_calendar_oauth_state='));
  if (!value) return null;
  try {
    return decodeURIComponent(value.slice('google_calendar_oauth_state='.length));
  } catch {
    return null;
  }
}

function settingsRedirect(request: Request, result: 'connected' | 'error') {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const target = new URL(`${basePath}/app/settings`, request.url);
  target.searchParams.set(result === 'connected' ? 'calendar_connected' : 'calendar_error', '1');
  const response = NextResponse.redirect(target);
  response.cookies.set('google_calendar_oauth_state', '', {
    httpOnly: true,
    secure: new URL(request.url).protocol === 'https:',
    sameSite: 'lax',
    maxAge: 0,
    path: `${basePath}/api/google/calendar/callback`,
  });
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const cookie = callbackCookie(request);
  if (url.searchParams.has('error') || !state || !cookie || state !== cookie) return settingsRedirect(request, 'error');
  const verifiedState = verifyGoogleOAuthState(state);
  const code = url.searchParams.get('code');
  if (!verifiedState || !code) return settingsRedirect(request, 'error');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return settingsRedirect(request, 'error');
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const redirectUri = new URL(`${basePath}/api/google/calendar/callback`, request.url).toString();
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenResponse.ok) {
      console.error('[integrations] google_calendar_authorization_code_exchange_failed');
      return settingsRedirect(request, 'error');
    }
    const tokenData = await tokenResponse.json() as { refresh_token?: string };
    if (!tokenData.refresh_token) {
      console.error('[integrations] google_calendar_refresh_token_missing');
      return settingsRedirect(request, 'error');
    }
    const encrypted = encryptGoogleToken(tokenData.refresh_token);
    const { error } = await getServiceClient().from('google_calendar_integrations').upsert({
      user_id: verifiedState.userId,
      refresh_token_ciphertext: encrypted.ciphertext,
      refresh_token_iv: encrypted.iv,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) {
      console.error('[integrations] google_calendar_token_store_failed');
      return settingsRedirect(request, 'error');
    }
    return settingsRedirect(request, 'connected');
  } catch {
    console.error('[integrations] google_calendar_callback_failed');
    return settingsRedirect(request, 'error');
  }
}

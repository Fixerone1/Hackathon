import { NextResponse } from 'next/server';
import { authenticatedUser, createGoogleOAuthState } from '@/lib/server/integrations';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await authenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Sign in again to connect Google Calendar.' }, { status: 401 });
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) return NextResponse.json({ error: 'Google Calendar is not configured on the site yet.' }, { status: 503 });

    const state = createGoogleOAuthState(user.id);
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const redirectUri = new URL(`${basePath}/api/google/calendar/callback`, request.url).toString();
    const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authorizationUrl.searchParams.set('client_id', clientId);
    authorizationUrl.searchParams.set('redirect_uri', redirectUri);
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.events');
    authorizationUrl.searchParams.set('access_type', 'offline');
    authorizationUrl.searchParams.set('prompt', 'consent');
    authorizationUrl.searchParams.set('state', state);

    const response = NextResponse.json({ authorization_url: authorizationUrl.toString() });
    response.headers.set('Cache-Control', 'no-store');
    response.cookies.set('google_calendar_oauth_state', state, {
      httpOnly: true,
      secure: new URL(request.url).protocol === 'https:',
      sameSite: 'lax',
      maxAge: 600,
      path: `${basePath}/api/google/calendar/callback`,
    });
    return response;
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'Google Calendar is not configured securely.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

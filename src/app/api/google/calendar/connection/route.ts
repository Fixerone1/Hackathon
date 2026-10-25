import { NextResponse } from 'next/server';
import { authenticatedUser, getServiceClient } from '@/lib/server/integrations';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const user = await authenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Sign in again to check Google Calendar.' }, { status: 401 });
    const { data, error } = await getServiceClient()
      .from('google_calendar_integrations')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) {
      console.error('[integrations] google_connection_status_failed');
      return NextResponse.json({ error: 'Google Calendar connection status could not be loaded.' }, { status: 500 });
    }
    return NextResponse.json({ connected: Boolean(data) });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'Google Calendar connection status could not be loaded.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

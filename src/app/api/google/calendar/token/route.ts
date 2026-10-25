import { NextResponse } from 'next/server';
import { authenticatedUser, getServiceClient } from '@/lib/server/integrations';

export const runtime = 'nodejs';

export async function DELETE(request: Request) {
  try {
    const user = await authenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Sign in again to manage Google Calendar.' }, { status: 401 });
    const { error } = await getServiceClient().from('google_calendar_integrations').delete().eq('user_id', user.id);
    if (error) {
      console.error('[integrations] google_token_delete_failed');
      return NextResponse.json({ error: 'Google Calendar could not be disconnected.' }, { status: 500 });
    }
    return NextResponse.json({ connected: false });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'Google Calendar could not be disconnected.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

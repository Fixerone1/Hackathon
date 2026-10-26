import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { authenticatedUser, decryptGoogleToken, getServiceClient } from '@/lib/server/integrations';

export const runtime = 'nodejs';
const legacyCalendarProperty = 'ukukhanya_app';

type SavedAction = {
  opportunity_id: string;
  scheduled_apply_date: string | null;
  opportunities: { title: string; closing_date: string | null } | { title: string; closing_date: string | null }[] | null;
};

type CalendarEvent = {
  id: string;
  summary: string;
  date: string;
  key: string;
};

function validDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function googleEventId(userId: string, key: string): string {
  return `uk${createHash('sha256').update(`${userId}:${key}`).digest('hex').slice(0, 40)}`;
}

async function googleRequest(url: string, token: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init?.headers || {}) },
  });
}

export async function POST(request: Request) {
  try {
    const user = await authenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Sign in again to sync Google Calendar.' }, { status: 401 });

    const admin = getServiceClient();
    const [{ data: integration, error: integrationError }, { data: actions, error: actionsError }] = await Promise.all([
      admin.from('google_calendar_integrations').select('refresh_token_ciphertext,refresh_token_iv').eq('user_id', user.id).maybeSingle(),
      admin.from('learner_opportunity_actions').select('opportunity_id,scheduled_apply_date,opportunities(title,closing_date)').eq('user_id', user.id).eq('status', 'saved'),
    ]);
    if (integrationError || actionsError) {
      console.error('[integrations] google_calendar_data_load_failed');
      return NextResponse.json({ error: 'Saved reminders could not be loaded for calendar sync.' }, { status: 500 });
    }
    if (!integration) return NextResponse.json({ connected: false });

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Google Calendar is not configured on the server.' }, { status: 503 });
    }
    const refreshToken = decryptGoogleToken(integration.refresh_token_ciphertext, integration.refresh_token_iv);
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    if (!tokenResponse.ok) {
      console.error('[integrations] google_access_token_refresh_failed');
      return NextResponse.json({ error: 'Google Calendar access expired. Reconnect your Google account in Settings.' }, { status: 502 });
    }
    const tokenBody = await tokenResponse.json() as { access_token?: string };
    if (!tokenBody.access_token) return NextResponse.json({ error: 'Google did not return a Calendar access token.' }, { status: 502 });

    const events: CalendarEvent[] = [];
    for (const action of (actions || []) as unknown as SavedAction[]) {
      const opportunity = Array.isArray(action.opportunities) ? action.opportunities[0] : action.opportunities;
      if (!opportunity) continue;
      const entries: Array<{ type: 'application' | 'closing'; date: string | null; title: string }> = [
        { type: 'application', date: action.scheduled_apply_date, title: `Application reminder: ${opportunity.title}` },
        { type: 'closing', date: opportunity.closing_date, title: `Opportunity closing: ${opportunity.title}` },
      ];
      for (const entry of entries) {
        if (!validDate(entry.date)) continue;
        const key = `${entry.type}:${action.opportunity_id}`;
        events.push({ id: googleEventId(user.id, key), key, date: entry.date, summary: entry.title.slice(0, 250) });
      }
    }

    const accessToken = tokenBody.access_token;
    const existing = new Map<string, string>();
    let pageToken: string | undefined;
    do {
      const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
      url.searchParams.set('maxResults', '2500');
      url.searchParams.set('privateExtendedProperty', `${legacyCalendarProperty}=1`);
      if (pageToken) url.searchParams.set('pageToken', pageToken);
      const response = await googleRequest(url.toString(), accessToken);
      if (!response.ok) {
        console.error('[integrations] google_calendar_list_failed');
        return NextResponse.json({ error: 'Google Calendar events could not be read.' }, { status: 502 });
      }
      const result = await response.json() as {
        items?: Array<{ id: string; extendedProperties?: { private?: { ukh_key?: string } } }>;
        nextPageToken?: string;
      };
      for (const event of result.items || []) {
        const key = event.extendedProperties?.private?.ukh_key;
        if (key) existing.set(key, event.id);
      }
      pageToken = result.nextPageToken;
    } while (pageToken);

    const desired = new Map(events.map((event) => [event.key, event]));
    for (const [key, eventId] of existing) {
      if (desired.has(key)) continue;
      const response = await googleRequest(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`, accessToken, { method: 'DELETE' });
      if (!response.ok && response.status !== 404) {
        console.error('[integrations] google_calendar_delete_failed');
        return NextResponse.json({ error: 'Outdated Beacon calendar reminders could not be removed.' }, { status: 502 });
      }
    }

    for (const event of events) {
      const nextDay = new Date(`${event.date}T00:00:00.000Z`);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      const eventBody = {
        summary: event.summary,
        description: 'Reminder from your Beacon learner workspace.',
        start: { date: event.date },
        end: { date: nextDay.toISOString().slice(0, 10) },
        reminders: { useDefault: true },
        extendedProperties: { private: { ukh_key: event.key, [legacyCalendarProperty]: '1' } },
      };
      const exists = existing.has(event.key);
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events${exists ? `/${encodeURIComponent(existing.get(event.key) || '')}` : ''}`;
      const response = await googleRequest(url, accessToken, {
        method: exists ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exists ? eventBody : { id: event.id, ...eventBody }),
      });
      if (!response.ok) {
        console.error('[integrations] google_calendar_upsert_failed');
        return NextResponse.json({ error: 'A reminder could not be saved to Google Calendar.' }, { status: 502 });
      }
    }
    return NextResponse.json({ connected: true, synced: events.length });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'Google Calendar could not be synced.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

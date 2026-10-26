import { NextResponse } from 'next/server';
import { authenticatedUser, getServiceClient } from '@/lib/server/integrations';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await authenticatedUser(request);
    if (!user?.email) return NextResponse.json({ error: 'Sign in again to request an email reminder.' }, { status: 401 });
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'The reminder request was invalid.' }, { status: 400 });
    }
    const opportunityId = body && typeof body === 'object' && 'opportunity_id' in body
      ? (body as { opportunity_id?: unknown }).opportunity_id
      : undefined;
    if (typeof opportunityId !== 'string' || !/^[0-9a-f-]{36}$/i.test(opportunityId)) {
      return NextResponse.json({ error: 'Choose a valid saved opportunity.' }, { status: 400 });
    }

    const admin = getServiceClient();
    const [{ data: preferences, error: preferenceError }, { data: action, error: actionError }] = await Promise.all([
      admin.from('email_preferences').select('application_reminders,paused').eq('user_id', user.id).maybeSingle(),
      admin.from('learner_opportunity_actions').select('scheduled_apply_date,status,opportunities(title)').eq('user_id', user.id).eq('opportunity_id', opportunityId).maybeSingle(),
    ]);
    if (preferenceError || actionError) {
      console.error('[notifications] application_reminder_lookup_failed');
      return NextResponse.json({ error: 'Your email reminder preference could not be checked.' }, { status: 500 });
    }
    if (!preferences?.application_reminders || preferences.paused || !action?.scheduled_apply_date || action.status !== 'saved') {
      return NextResponse.json({ sent: false });
    }
    const apiKey = process.env.RESEND_API_KEY;
    const sender = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !sender) return NextResponse.json({ error: 'Email alerts are not configured on the site yet.' }, { status: 503 });

    const opportunity = Array.isArray(action.opportunities) ? action.opportunities[0] : action.opportunities;
    const title = opportunity?.title || 'your saved opportunity';
    const date = new Intl.DateTimeFormat('en-ZA', { dateStyle: 'long', timeZone: 'UTC' })
      .format(new Date(`${action.scheduled_apply_date}T12:00:00Z`));
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `application-reminder-${user.id}-${opportunityId}-${action.scheduled_apply_date}`,
      },
      body: JSON.stringify({
        from: sender,
        to: [user.email],
        subject: 'Your Beacon application reminder',
        text: `You planned to return to ${title} on ${date}. Open your Beacon workspace to review your saved opportunity.`,
      }),
    });
    if (!response.ok) {
      console.error('[notifications] application_reminder_delivery_failed');
      return NextResponse.json({ error: 'Your reminder was saved, but the email could not be sent.' }, { status: 502 });
    }
    return NextResponse.json({ sent: true });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'Your email reminder could not be sent.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

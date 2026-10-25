import { getSupabase } from '@/lib/supabase';

type ApiResult = { sent?: boolean; connected?: boolean };

export function integrationApiPath(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`;
}

async function postIntegration(path: string, method: 'POST' | 'DELETE' = 'POST', body?: unknown): Promise<ApiResult> {
  const { data, error } = await getSupabase().auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error('Sign in again to connect integrations.');

  const response = await fetch(integrationApiPath(path), {
    method,
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json() as ApiResult & { error?: string };
  if (!response.ok) throw new Error(result.error || 'The integration request could not be completed.');
  return result;
}

export function syncGoogleCalendar(): Promise<ApiResult> {
  return postIntegration('/api/google/calendar/sync');
}

export function sendApplicationReminder(opportunityId: string): Promise<ApiResult> {
  return postIntegration('/api/notifications/application-reminder', 'POST', { opportunity_id: opportunityId });
}

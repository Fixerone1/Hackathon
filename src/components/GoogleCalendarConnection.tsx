'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { integrationApiPath } from '@/lib/integrations';
import { getSupabase } from '@/lib/supabase';

const connectionErrorKey = 'careerforge-google-calendar-error';

export function GoogleCalendarConnection() {
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadConnection = useCallback(async () => {
    try {
      const supabase = getSupabase();
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!data.session) throw new Error('Sign in again to manage calendar reminders.');
      const response = await fetch(integrationApiPath('/api/google/calendar/connection'), {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const result = await response.json() as { connected?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error || 'Google Calendar status could not be loaded.');
      setConnected(result.connected === true);
      setError(localStorage.getItem(connectionErrorKey) || '');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Google Calendar status could not be loaded.');
    }
  }, []);

  useEffect(() => {
    void loadConnection();
    window.addEventListener('uk-calendar-connected', loadConnection);
    const params = new URLSearchParams(window.location.search);
    if (params.has('calendar_connected')) {
      localStorage.removeItem(connectionErrorKey);
      setError('');
      setMessage('Google Calendar is connected. Your saved dates will sync automatically.');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.has('calendar_error')) {
      localStorage.removeItem(connectionErrorKey);
      setError('Google Calendar could not be connected. Check the Google OAuth setup and try again.');
      window.history.replaceState({}, '', window.location.pathname);
    }
    return () => window.removeEventListener('uk-calendar-connected', loadConnection);
  }, [loadConnection]);

  async function connect() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const { data, error: sessionError } = await getSupabase().auth.getSession();
      if (sessionError) throw sessionError;
      if (!data.session) throw new Error('Sign in again to connect Google Calendar.');
      const response = await fetch(integrationApiPath('/api/google/calendar/authorize'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const result = await response.json() as { authorization_url?: string; error?: string };
      if (!response.ok || !result.authorization_url) throw new Error(result.error || 'Google Calendar could not be connected.');
      window.location.assign(result.authorization_url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Google Calendar could not be connected.');
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const supabase = getSupabase();
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!data.session) throw new Error('Sign in again to disconnect Google Calendar.');
      const response = await fetch(integrationApiPath('/api/google/calendar/token'), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Google Calendar could not be disconnected.');
      setConnected(false);
      localStorage.removeItem(connectionErrorKey);
      setMessage('Calendar syncing is off. Existing reminders in Google Calendar are not removed.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Google Calendar could not be disconnected.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7" aria-labelledby="calendar-connection-heading">
      <div className="flex items-start gap-3">
        <CalendarDays size={21} className="mt-1 shrink-0 text-black" aria-hidden="true" />
        <div>
          <h2 id="calendar-connection-heading" className="section-heading">Google Calendar</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Save application dates and opportunity closing dates to your primary calendar. Ukukhanya only manages reminders it created.</p>
          <p className="mt-2 text-sm font-medium text-midnight" role="status">{connected ? 'Connected' : 'Not connected'}</p>
        </div>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-4 text-sm text-emerald-dark">{message}</p>}
      {connected
        ? <button type="button" className="btn-secondary mt-4" onClick={() => void disconnect()} disabled={busy}>{busy ? 'Disconnecting...' : 'Disconnect Google Calendar'}</button>
        : <button type="button" className="btn-primary mt-4" onClick={() => void connect()} disabled={busy}>{busy ? 'Connecting...' : 'Connect Google Calendar'}</button>}
    </section>
  );
}

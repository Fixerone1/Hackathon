'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { PageIntro } from '@/components/PageIntro';

type Preferences = {
  instant_matches: boolean;
  weekly_digest: boolean;
  closing_reminders: boolean;
  frequency: 'weekly' | 'instant';
  quiet_hours_start: string;
  quiet_hours_end: string;
  paused: boolean;
};

type AccessibilityPreferences = {
  highContrast: boolean;
  reduceMotion: boolean;
  largerText: boolean;
};

type ConsentDates = {
  instant_matches_consented_at: string | null;
  weekly_digest_consented_at: string | null;
  closing_reminders_consented_at: string | null;
};

const defaults: Preferences = {
  instant_matches: false,
  weekly_digest: false,
  closing_reminders: false,
  frequency: 'weekly',
  quiet_hours_start: '20:00',
  quiet_hours_end: '08:00',
  paused: false,
};

export default function SettingsPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [accessibility, setAccessibility] = useState<AccessibilityPreferences>({ highContrast: false, reduceMotion: false, largerText: false });
  const [privacyBusy, setPrivacyBusy] = useState(false);
  const [consentDates, setConsentDates] = useState<ConsentDates>({
    instant_matches_consented_at: null,
    weekly_digest_consented_at: null,
    closing_reminders_consented_at: null,
  });

  useEffect(() => {
    let active = true;
    async function loadPreferences() {
      try {
        const supabase = getSupabase();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) throw new Error('Sign in again to load your settings.');
        const { data, error } = await supabase.from('email_preferences').select('*').maybeSingle();
        if (error) throw error;
        if (!active) return;
        setPreferences({ ...defaults, ...data });
        setConsentDates({
          instant_matches_consented_at: data?.instant_matches_consented_at || null,
          weekly_digest_consented_at: data?.weekly_digest_consented_at || null,
          closing_reminders_consented_at: data?.closing_reminders_consented_at || null,
        });
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Settings could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadPreferences();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem('careerforge-accessibility');
    if (saved) {
      try {
        setAccessibility((current) => ({ ...current, ...JSON.parse(saved) as AccessibilityPreferences }));
      } catch {
        localStorage.removeItem('careerforge-accessibility');
      }
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('hc', accessibility.highContrast);
    root.classList.toggle('reduce-motion', accessibility.reduceMotion);
    root.classList.toggle('larger-text', accessibility.largerText);
    localStorage.setItem('careerforge-accessibility', JSON.stringify(accessibility));
  }, [accessibility]);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error('Sign in again to save your settings.');
      const now = new Date().toISOString();
      const updatedConsentDates: ConsentDates = {
        instant_matches_consented_at: preferences.instant_matches ? consentDates.instant_matches_consented_at || now : null,
        weekly_digest_consented_at: preferences.weekly_digest ? consentDates.weekly_digest_consented_at || now : null,
        closing_reminders_consented_at: preferences.closing_reminders ? consentDates.closing_reminders_consented_at || now : null,
      };
      const { error } = await supabase.from('email_preferences').upsert({
        user_id: authData.user.id,
        ...preferences,
        ...updatedConsentDates,
      }, { onConflict: 'user_id' });
      if (error) throw error;
      setConsentDates(updatedConsentDates);
      setMessage('Your notification preferences and email consent choices were saved.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Settings could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function exportData() {
    setPrivacyBusy(true);
    setError('');
    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error('Sign in again to export your data.');
      const [profile, progress, emailPreferences, privacyConsent] = await Promise.all([
        supabase.from('learner_profiles').select('*').maybeSingle(),
        supabase.from('learner_progress').select('*').maybeSingle(),
        supabase.from('email_preferences').select('*').maybeSingle(),
        supabase.from('privacy_consents').select('*').maybeSingle(),
      ]);
      const queryError = profile.error || progress.error || emailPreferences.error || privacyConsent.error;
      if (queryError) throw queryError;
      const file = new Blob([JSON.stringify({
        account: { id: authData.user.id, email: authData.user.email, name: authData.user.user_metadata?.name || '' },
        profile: profile.data,
        progress: progress.data,
        email_preferences: emailPreferences.data,
        privacy_consents: privacyConsent.data,
      }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'careerforge-data-export.json';
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage('Your data export was downloaded.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your export could not be prepared.');
    } finally {
      setPrivacyBusy(false);
    }
  }

  async function deleteAccount() {
    if (!window.confirm('Permanently delete your CareerForge account and its saved profile, checklist, and notification settings? This cannot be undone.')) return;
    setPrivacyBusy(true);
    setError('');
    try {
      const supabase = getSupabase();
      const { error } = await supabase.rpc('delete_my_account');
      if (error) throw error;
      await supabase.auth.signOut({ scope: 'local' });
      localStorage.removeItem('careerforge-accessibility');
      router.replace('/');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your account could not be deleted.');
    } finally {
      setPrivacyBusy(false);
    }
  }

  const toggleClass = 'h-5 w-5 accent-sunshine-dark';
  if (loading) return <p className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600 sm:px-6 lg:px-8" role="status">Loading settings...</p>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro eyebrow="Account" title="Settings" description="Choose what you agree to receive. All email categories are off until you opt in." />
      <section className="max-w-3xl rounded-2xl border border-[#e5e5e5] bg-[#f7f7f7] p-5 sm:p-7" aria-labelledby="notification-heading">
        <h2 id="notification-heading" className="section-heading">Email notifications</h2>
        <p className="mt-2 text-sm text-slate-600">Email delivery is not enabled yet. Your preferences are saved for when a provider is configured.</p>
        <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
          {([
            ['instant_matches', 'New opportunity alerts'],
            ['weekly_digest', 'Weekly opportunity digest'],
            ['closing_reminders', 'Closing-date reminders'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex min-h-14 items-center gap-3 py-3 text-sm text-slate-700">
              <input type="checkbox" className={toggleClass} checked={preferences[key]} onChange={(event) => update(key, event.target.checked)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="frequency" className="label">Frequency cap</label>
            <select id="frequency" className="input" value={preferences.frequency} onChange={(event) => update('frequency', event.target.value as Preferences['frequency'])}>
              <option value="weekly">Weekly (max 3 emails)</option><option value="instant">Instant alerts</option>
            </select>
          </div>
          <div>
            <label htmlFor="quiet-start" className="label">Quiet hours start</label>
            <input id="quiet-start" type="time" className="input" value={preferences.quiet_hours_start} onChange={(event) => update('quiet_hours_start', event.target.value)} />
          </div>
          <div>
            <label htmlFor="quiet-end" className="label">Quiet hours end</label>
            <input id="quiet-end" type="time" className="input" value={preferences.quiet_hours_end} onChange={(event) => update('quiet_hours_end', event.target.value)} />
          </div>
        </div>
        <label className="mt-5 flex min-h-12 items-center gap-3 text-sm text-slate-700">
          <input type="checkbox" className={toggleClass} checked={preferences.paused} onChange={(event) => update('paused', event.target.checked)} />
          Pause all email notifications
        </label>
        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="mt-4 text-sm text-emerald-dark">{message}</p>}
        <button type="button" className="btn-primary mt-5" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save preferences'}</button>
      </section>
      <section className="mt-10 max-w-3xl border-t border-slate-200 pt-6" aria-labelledby="privacy-heading">
        <h2 className="font-semibold text-midnight">Accessibility</h2>
        <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
          {([
            ['highContrast', 'High contrast'],
            ['reduceMotion', 'Reduce motion'],
            ['largerText', 'Larger text'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex min-h-12 items-center gap-3 py-2 text-sm text-slate-700">
              <input type="checkbox" className="h-5 w-5 accent-sunshine-dark" checked={accessibility[key]} onChange={(event) => setAccessibility((current) => ({ ...current, [key]: event.target.checked }))} />
              {label}
            </label>
          ))}
        </div>
      </section>
      <section className="mt-10 max-w-3xl border-t border-slate-200 pt-6" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading" className="font-semibold text-midnight">Privacy and data</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Export or delete the account and learner data stored by this app. Account deletion requires the privacy migration to be applied in Supabase.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="btn-secondary" onClick={exportData} disabled={privacyBusy}>Export my data</button>
          <button type="button" className="btn-secondary border-red-300 text-red-800 hover:bg-red-50" onClick={deleteAccount} disabled={privacyBusy}>Delete my account</button>
        </div>
      </section>
    </div>
  );
}

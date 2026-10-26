'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { PageIntro } from '@/components/PageIntro';
import { GoogleCalendarConnection } from '@/components/GoogleCalendarConnection';

type Preferences = {
  instant_matches: boolean;
  weekly_digest: boolean;
  closing_reminders: boolean;
  application_reminders: boolean;
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

type ForgePreferences = {
  forge_name: string;
  tone: 'chill' | 'straight_up' | 'coach';
  language: 'en-ZA';
  data_light: boolean;
  personalisation_paused: boolean;
  streak_enabled: boolean;
};

type HomeFocus = 'all' | 'study' | 'work' | 'business' | 'money';

type ConsentDates = {
  instant_matches_consented_at: string | null;
  weekly_digest_consented_at: string | null;
  closing_reminders_consented_at: string | null;
  application_reminders_consented_at: string | null;
};

const defaults: Preferences = {
  instant_matches: false,
  weekly_digest: false,
  closing_reminders: false,
  application_reminders: false,
  frequency: 'weekly',
  quiet_hours_start: '20:00',
  quiet_hours_end: '08:00',
  paused: false,
};

const forgeDefaults: ForgePreferences = {
  forge_name: 'Forge',
  tone: 'straight_up',
  language: 'en-ZA',
  data_light: false,
  personalisation_paused: false,
  streak_enabled: false,
};

export default function SettingsPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState(defaults);
  const [forgePreferences, setForgePreferences] = useState(forgeDefaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [accessibility, setAccessibility] = useState<AccessibilityPreferences>({ highContrast: false, reduceMotion: false, largerText: false });
  const [dashboardAlerts, setDashboardAlerts] = useState(true);
  const [homeFocus, setHomeFocus] = useState<HomeFocus>('all');
  const [localPreferencesLoaded, setLocalPreferencesLoaded] = useState(false);
  const [privacyBusy, setPrivacyBusy] = useState(false);
  const [consentDates, setConsentDates] = useState<ConsentDates>({
    instant_matches_consented_at: null,
    weekly_digest_consented_at: null,
    closing_reminders_consented_at: null,
    application_reminders_consented_at: null,
  });

  useEffect(() => {
    let active = true;
    async function loadPreferences() {
      try {
        const supabase = getSupabase();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) throw new Error('Sign in again to load your settings.');
        const [emailResult, forgeResult] = await Promise.all([
          supabase.from('email_preferences').select('*').maybeSingle(),
          supabase.from('learner_preferences').select('*').maybeSingle(),
        ]);
        if (emailResult.error) throw emailResult.error;
        if (!active) return;
        setPreferences({ ...defaults, ...emailResult.data });
        if (forgeResult.error) throw forgeResult.error;
        setForgePreferences({ ...forgeDefaults, ...forgeResult.data });
        setConsentDates({
          instant_matches_consented_at: emailResult.data?.instant_matches_consented_at || null,
          weekly_digest_consented_at: emailResult.data?.weekly_digest_consented_at || null,
          closing_reminders_consented_at: emailResult.data?.closing_reminders_consented_at || null,
          application_reminders_consented_at: emailResult.data?.application_reminders_consented_at || null,
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
    try {
      const savedAccessibility = localStorage.getItem('beacon:accessibility');
      if (savedAccessibility) {
        const parsed = JSON.parse(savedAccessibility) as Partial<AccessibilityPreferences>;
        setAccessibility({
          highContrast: parsed.highContrast === true,
          reduceMotion: parsed.reduceMotion === true,
          largerText: parsed.largerText === true,
        });
      }
      const savedFocus = localStorage.getItem('beacon:home-focus');
      if (savedFocus === 'study' || savedFocus === 'work' || savedFocus === 'business' || savedFocus === 'money') {
        setHomeFocus(savedFocus);
      }
      setDashboardAlerts(localStorage.getItem('beacon:dashboard-alerts') !== 'false');
    } catch {
      localStorage.removeItem('beacon:accessibility');
      localStorage.removeItem('beacon:home-focus');
    } finally {
      setLocalPreferencesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!localPreferencesLoaded) return;
    const root = document.documentElement;
    root.classList.toggle('hc', accessibility.highContrast);
    root.classList.toggle('reduce-motion', accessibility.reduceMotion);
    root.classList.toggle('larger-text', accessibility.largerText);
    localStorage.setItem('beacon:accessibility', JSON.stringify(accessibility));
    localStorage.setItem('beacon:home-focus', homeFocus);
    localStorage.setItem('beacon:dashboard-alerts', String(dashboardAlerts));
  }, [accessibility, dashboardAlerts, homeFocus, localPreferencesLoaded]);

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
        application_reminders_consented_at: preferences.application_reminders ? consentDates.application_reminders_consented_at || now : null,
      };
      const { error } = await supabase.from('email_preferences').upsert({
        user_id: authData.user.id,
        ...preferences,
        ...updatedConsentDates,
      }, { onConflict: 'user_id' });
      if (error) throw error;
      const { error: forgeError } = await supabase.from('learner_preferences').upsert({
        user_id: authData.user.id,
        ...forgePreferences,
      }, { onConflict: 'user_id' });
      if (forgeError) throw forgeError;
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
      const [profile, progress, emailPreferences, privacyConsent, opportunityActions, skillsPassport] = await Promise.all([
        supabase.from('learner_profiles').select('*').maybeSingle(),
        supabase.from('learner_progress').select('*').maybeSingle(),
        supabase.from('email_preferences').select('*').maybeSingle(),
        supabase.from('privacy_consents').select('*').maybeSingle(),
        supabase.from('learner_opportunity_actions').select('*'),
        supabase.from('skills_passports').select('*').maybeSingle(),
      ]);
      const queryError = profile.error || progress.error || emailPreferences.error || privacyConsent.error || opportunityActions.error || skillsPassport.error;
      if (queryError) throw queryError;
      const file = new Blob([JSON.stringify({
        account: { id: authData.user.id, email: authData.user.email, name: authData.user.user_metadata?.name || '' },
        profile: profile.data,
        progress: progress.data,
        email_preferences: emailPreferences.data,
        privacy_consents: privacyConsent.data,
        opportunity_actions: opportunityActions.data,
        skills_passport: skillsPassport.data,
        local_preferences: {
          dashboard_alerts: localStorage.getItem('beacon:dashboard-alerts') !== 'false',
          homepage_focus: localStorage.getItem('beacon:home-focus') || 'all',
          accessibility: localStorage.getItem('beacon:accessibility'),
          opportunity_notes: authData.user.email
            ? localStorage.getItem(`beacon:opportunity-notes-${authData.user.email}`)
            : null,
        },
      }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'beacon-data-export.json';
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
    if (!window.confirm('Permanently delete your Beacon account, saved profile, checklist, notification settings, and Skills Passport? Any Skills Passport share link will stop working. This cannot be undone.')) return;
    setPrivacyBusy(true);
    setError('');
    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error('Sign in again before deleting your account.');
      const { error } = await supabase.rpc('delete_my_account');
      if (error) throw error;
      await supabase.auth.signOut({ scope: 'local' });
      localStorage.removeItem('beacon:accessibility');
      localStorage.removeItem('beacon:home-focus');
      localStorage.removeItem('beacon:dashboard-alerts');
      localStorage.removeItem(`beacon:opportunities-viewed-${authData.user.id}`);
      if (authData.user.email) localStorage.removeItem(`beacon:opportunity-notes-${authData.user.email}`);
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
      <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7" aria-labelledby="notification-heading">
        <h2 id="notification-heading" className="section-heading">Notification preferences</h2>
        <p className="mt-2 text-sm text-slate-600">Dashboard alerts are checked against your profile when you open the dashboard. Email is sent only when you opt in and the site email service is configured. Planned application-date emails are active; the other email categories are saved for future alert delivery.</p>
        <label className="mt-4 flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-midnight">
          <input type="checkbox" className={toggleClass} checked={dashboardAlerts} onChange={(event) => setDashboardAlerts(event.target.checked)} />
          Show new matching opportunities in my dashboard inbox
        </label>
        <p className="mt-2 text-xs text-slate-600">This dashboard alert preference is saved on this device. Email choices below are saved to your account.</p>
        <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
          {([
            ['instant_matches', 'New opportunity alerts'],
            ['weekly_digest', 'Weekly opportunity digest'],
            ['closing_reminders', 'Closing-date reminders'],
            ['application_reminders', 'Email me when I set or change a planned application date'],
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
      <GoogleCalendarConnection />
      <section className="mt-10 max-w-3xl border-t border-slate-200 pt-6" aria-labelledby="accessibility-heading">
        <h2 id="accessibility-heading" className="font-semibold text-midnight">Make Beacon work for you</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Choose a focus and we’ll bring the most relevant tools to the top of your homepage. You can change it any time.</p>
        <label htmlFor="home-focus" className="label mt-4">My main focus right now</label>
        <select id="home-focus" className="input max-w-sm" value={homeFocus} onChange={(event) => setHomeFocus(event.target.value as HomeFocus)}>
          <option value="all">Show me everything</option>
          <option value="study">Study and learning</option>
          <option value="work">Finding or growing in work</option>
          <option value="business">Starting a business</option>
          <option value="money">Building money confidence</option>
        </select>
        <h3 className="mt-6 font-semibold text-midnight">Accessibility</h3>
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
      <section className="mt-10 max-w-3xl border-t border-slate-200 pt-6" aria-labelledby="forge-preferences-heading">
        <h2 id="forge-preferences-heading" className="font-semibold text-midnight">Your Beacon Guide preferences</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Choose how your personal workspace speaks and what it remembers. Personalisation pause stops tailored suggestions; it does not delete your saved profile.</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="forge-name" className="label">Guide name</label>
            <input id="forge-name" className="input" maxLength={40} value={forgePreferences.forge_name} onChange={(event) => setForgePreferences((current) => ({ ...current, forge_name: event.target.value }))} />
          </div>
          <div>
            <label htmlFor="forge-tone" className="label">Voice</label>
            <select id="forge-tone" className="input" value={forgePreferences.tone} onChange={(event) => setForgePreferences((current) => ({ ...current, tone: event.target.value as ForgePreferences['tone'] }))}>
              <option value="chill">Chill</option><option value="straight_up">Straight-up</option><option value="coach">Coach</option>
            </select>
          </div>
          <div>
            <label htmlFor="forge-language" className="label">Language</label>
            <select id="forge-language" className="input" value={forgePreferences.language} onChange={(event) => setForgePreferences((current) => ({ ...current, language: event.target.value as ForgePreferences['language'] }))}>
              <option value="en-ZA">English (South Africa)</option>
            </select>
          </div>
        </div>
        <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
          {([
            ['data_light', 'Use fewer images and lighter pages'],
            ['personalisation_paused', 'Pause personalisation'],
            ['streak_enabled', 'Show an optional, forgiving activity streak'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex min-h-12 items-center gap-3 py-2 text-sm text-slate-700">
              <input type="checkbox" className={toggleClass} checked={forgePreferences[key]} onChange={(event) => setForgePreferences((current) => ({ ...current, [key]: event.target.checked }))} />
              {label}
            </label>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">Beacon Guide’s tone and personalization controls apply to contextual suggestions. Streaks start off and never punish missed days.</p>
        <Link href="/app/forge" className="link mt-4 inline-flex text-sm">What Beacon Guide knows about me</Link>
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

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, Bell, BriefcaseBusiness, CalendarDays, FileText, FolderOpen, Heart, ListTodo, Plus, Trash2 } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

type SpaceTab = 'todo' | 'saved' | 'applications' | 'documents' | 'drafts';
type SavedItem = {
  id: string;
  item_type: string;
  item_id: string;
  title: string;
  link: string;
  note: string;
  remind_at: string | null;
  closing_on: string | null;
  created_at: string;
};
type Draft = {
  id: string;
  kind: string;
  ref_id: string;
  title: string;
  progress: number;
  data: Record<string, unknown>;
  updated_at: string;
  expires_at: string;
};
type Application = {
  id: string;
  opportunity_id: string | null;
  title: string;
  employer: string;
  url: string;
  stage: string;
  closed_reason: string | null;
  applied_on: string | null;
  closing_on: string | null;
  cv_version_id: string;
  cover_letter_id: string;
  contact: string;
  notes: string;
  next_step: string;
  next_step_on: string | null;
  documents_required: string[];
  created_at: string;
  updated_at: string;
};

const tabs: Array<{ id: SpaceTab; label: string; Icon: typeof ListTodo }> = [
  { id: 'todo', label: 'To do', Icon: ListTodo },
  { id: 'saved', label: 'Saved', Icon: Heart },
  { id: 'applications', label: 'Applications', Icon: BriefcaseBusiness },
  { id: 'documents', label: 'Documents', Icon: FolderOpen },
  { id: 'drafts', label: 'Drafts', Icon: FileText },
];

const stages = ['saved', 'preparing', 'applied', 'interview', 'offer', 'closed'] as const;
const stageLabels: Record<(typeof stages)[number], string> = {
  saved: 'Saved',
  preparing: 'Preparing',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  closed: 'Closed',
};
const documentChecklist = ['ID copy', 'Certified certificates', 'Matric certificate', 'Proof of address', 'CV', 'References'];
const draftPaths: Record<string, string> = {
  cv: '/app/employment/cv',
  cover_letter: '/app/employment/cv',
  assessment: '/app/employment/assessment',
  pathway: '/app/employment/pathways',
  growth: '/app/growth',
  goal: '/app/money',
  form: '/app/profile',
};

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateLabel(value: string | null) {
  if (!value) return 'No date set';
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}

function dateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : '';
}

function localDateTime(value: string) {
  return value ? new Date(`${value}T09:00:00`).toISOString() : null;
}

function offsetDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

function beforeClosingDate(value: string | null) {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return dateKey(date) < dateKey(new Date()) ? dateKey(new Date()) : dateKey(date);
}

async function syncApplicationReminders(
  supabase: ReturnType<typeof getSupabase>,
  userId: string,
  application: Application,
  updates: Partial<Application>,
) {
  const stage = updates.stage ?? application.stage;
  const closingDate = 'closing_on' in updates ? updates.closing_on : application.closing_on;
  const nextStepDate = 'next_step_on' in updates ? updates.next_step_on : application.next_step_on;
  const reminderWrites = [
    stage === 'applied' || stage === 'closed' ? null : closingDate
      ? supabase.from('reminders').upsert({
        user_id: userId,
        target_type: 'application',
        target_id: `${application.id}:closing`,
        remind_at: localDateTime(beforeClosingDate(closingDate)),
        channel: 'in_app',
      }, { onConflict: 'user_id,target_type,target_id,channel' })
      : supabase.from('reminders').delete().eq('user_id', userId).eq('target_type', 'application').eq('target_id', `${application.id}:closing`),
    stage === 'closed' ? null : nextStepDate
      ? supabase.from('reminders').upsert({
        user_id: userId,
        target_type: 'application',
        target_id: `${application.id}:next-step`,
        remind_at: localDateTime(nextStepDate),
        channel: 'in_app',
      }, { onConflict: 'user_id,target_type,target_id,channel' })
      : supabase.from('reminders').delete().eq('user_id', userId).eq('target_type', 'application').eq('target_id', `${application.id}:next-step`),
  ].filter((write) => write !== null);
  const results = await Promise.all(reminderWrites);
  const reminderError = results.find((result) => result.error)?.error;
  if (reminderError) throw new Error(reminderError.message);
}

function csvEscape(value: unknown) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function exportApplications(applications: Application[]) {
  const headers = ['Title', 'Employer', 'Stage', 'URL', 'Applied on', 'Closing date', 'Next step', 'Next step date', 'Contact', 'Notes'];
  const rows = applications.map((application) => [
    application.title, application.employer, application.stage, application.url,
    application.applied_on, application.closing_on, application.next_step,
    application.next_step_on, application.contact, application.notes,
  ]);
  const blob = new Blob([[headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'beacon-applications.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadCalendarEvent(application: Application) {
  const date = application.next_step_on || application.closing_on;
  if (!date) return;
  const start = date.replaceAll('-', '');
  const title = `Beacon: ${application.next_step || application.title} · ${application.employer}`;
  const escape = (value: string) => value.replaceAll('\\', '\\\\').replaceAll(',', '\\,').replaceAll(';', '\\;').replaceAll('\n', '\\n');
  const content = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Beacon//Application Tracker//EN',
    'BEGIN:VEVENT', `UID:${application.id}@beacon`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART;VALUE=DATE:${start}`, `SUMMARY:${escape(title)}`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'beacon-application-reminder.ics';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function MySpace() {
  const [tab, setTab] = useState<SpaceTab>('todo');
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualEmployer, setManualEmployer] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualClosingDate, setManualClosingDate] = useState('');

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    if (tabs.some(({ id }) => id === requestedTab)) setTab(requestedTab as SpaceTab);
  }, []);

  async function loadSpace() {
    setLoading(true);
    setError('');
    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error('Sign in to view My Space.');
      const [savedResult, draftResult, applicationResult] = await Promise.all([
        supabase.from('saved_items').select('id,item_type,item_id,title,link,note,remind_at,closing_on,created_at').eq('user_id', authData.user.id).order('created_at', { ascending: false }),
        supabase.from('drafts').select('id,kind,ref_id,title,progress,data,updated_at,expires_at').eq('user_id', authData.user.id).lt('progress', 100).gt('expires_at', new Date().toISOString()).order('updated_at', { ascending: false }),
        supabase.from('applications').select('*').eq('user_id', authData.user.id).order('updated_at', { ascending: false }),
      ]);
      if (savedResult.error) throw savedResult.error;
      if (draftResult.error) throw draftResult.error;
      if (applicationResult.error) throw applicationResult.error;
      setSavedItems((savedResult.data || []) as SavedItem[]);
      setDrafts((draftResult.data || []) as Draft[]);
      setApplications((applicationResult.data || []) as Application[]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'My Space could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadSpace(); }, []);

  const today = dateKey(new Date());
  const dueCount = savedItems.filter((item) => item.remind_at && item.remind_at.slice(0, 10) <= today).length
    + applications.filter((item) => [item.closing_on, item.next_step_on].some((date) => date && date <= today)).length;

  const todoItems = useMemo(() => [
    ...drafts.filter((draft) => draft.progress < 100).map((draft) => ({
      id: `draft:${draft.id}`,
      title: `Continue ${draft.title}`,
      date: draft.updated_at.slice(0, 10),
      href: draftPaths[draft.kind] || '/app/profile',
      label: `${draft.progress}% complete`,
    })),
    ...savedItems.filter((item) => item.remind_at).map((item) => ({
      id: `saved:${item.id}`,
      title: item.title,
      date: item.remind_at!.slice(0, 10),
      href: item.link,
      label: 'Saved-item reminder',
    })),
    ...applications.flatMap((application) => [
      ...(application.next_step_on ? [{
        id: `next:${application.id}`,
        title: application.next_step || `Follow up: ${application.title}`,
        date: application.next_step_on,
        href: `/app/my-space?tab=applications`,
        label: application.employer || stageLabels[application.stage as keyof typeof stageLabels] || 'Application',
      }] : []),
      ...(application.closing_on && application.stage !== 'closed' ? [{
        id: `closing:${application.id}`,
        title: `Closing date: ${application.title}`,
        date: application.closing_on,
        href: `/app/my-space?tab=applications`,
        label: application.employer || 'Application deadline',
      }] : []),
    ]),
  ].sort((a, b) => a.date.localeCompare(b.date)), [applications, drafts, savedItems]);

  const visibleApplications = applications.filter((application) => stageFilter === 'all' || application.stage === stageFilter);
  const monthStart = `${today.slice(0, 7)}-01`;
  const thisMonthApplications = applications.filter((application) => application.applied_on && application.applied_on >= monthStart).length;
  const interviews = applications.filter((application) => application.stage === 'interview').length;
  const appliedOrLater = applications.filter((application) => ['applied', 'interview', 'offer', 'closed'].includes(application.stage)).length;
  const positiveResponses = applications.filter((application) => ['interview', 'offer'].includes(application.stage)).length;
  const responseRate = appliedOrLater ? Math.round(positiveResponses * 100 / appliedOrLater) : 0;

  async function removeSavedItem(item: SavedItem) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error('Sign in again to update saved items.');
      const { error: deleteError } = await supabase.from('saved_items').delete().eq('user_id', authData.user.id).eq('id', item.id);
      if (deleteError) throw deleteError;
      const { error: reminderError } = await supabase.from('reminders').delete()
        .eq('user_id', authData.user.id).eq('target_type', 'saved_item').eq('target_id', item.id);
      if (reminderError) throw reminderError;
      if (item.item_type === 'opportunity' || item.item_type === 'funding') {
        const { error: actionError } = await supabase.from('learner_opportunity_actions').delete()
          .eq('user_id', authData.user.id).eq('opportunity_id', item.item_id);
        if (actionError) throw actionError;
      }
      setSavedItems((current) => current.filter(({ id }) => id !== item.id));
      setMessage(`Removed “${item.title}” from Saved.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The saved item could not be removed.');
    } finally {
      setBusy(false);
    }
  }

  async function updateSavedItem(item: SavedItem, values: Partial<Pick<SavedItem, 'note' | 'remind_at'>>) {
    setError('');
    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error('Sign in again to update this saved item.');
      const { error: saveError } = await supabase.from('saved_items').update(values).eq('id', item.id).eq('user_id', authData.user.id);
      if (saveError) throw saveError;
      if ('remind_at' in values) {
        const reminderQuery = values.remind_at
          ? supabase.from('reminders').upsert({
            user_id: authData.user.id,
            target_type: 'saved_item',
            target_id: item.id,
            remind_at: values.remind_at,
            channel: 'in_app',
          }, { onConflict: 'user_id,target_type,target_id,channel' })
          : supabase.from('reminders').delete()
            .eq('user_id', authData.user.id)
            .eq('target_type', 'saved_item')
            .eq('target_id', item.id);
        const { error: reminderError } = await reminderQuery;
        if (reminderError) throw reminderError;
      }
      setSavedItems((current) => current.map((saved) => saved.id === item.id ? { ...saved, ...values } : saved));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your saved item could not be updated.');
    }
  }

  async function changeStage(application: Application, stage: string) {
    setError('');
    setMessage('');
    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error('Sign in again to update this application.');
      if (application.opportunity_id && (stage === 'applied' || stage === 'saved')) {
        const { error: actionError } = await supabase.from('learner_opportunity_actions')
          .update({ status: stage === 'applied' ? 'applied' : 'saved' })
          .eq('user_id', authData.user.id).eq('opportunity_id', application.opportunity_id);
        if (actionError) throw actionError;
      }
      const updates: Partial<Application> = {
        stage,
        closed_reason: stage === 'closed' ? application.closed_reason : null,
        applied_on: stage === 'applied' && !application.applied_on ? today : application.applied_on,
      };
      const { error: updateError } = await supabase.from('applications').update(updates).eq('id', application.id).eq('user_id', authData.user.id);
      if (updateError) throw updateError;
      await syncApplicationReminders(supabase, authData.user.id, application, updates);
      setApplications((current) => current.map((item) => item.id === application.id ? { ...item, ...updates } : item));
      setMessage(`Application moved to ${stageLabels[stage as keyof typeof stageLabels]}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The application stage could not be changed.');
    }
  }

  async function updateApplication(application: Application, updates: Partial<Application>) {
    setError('');
    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error('Sign in again to update this application.');
      const { error: updateError } = await supabase.from('applications').update(updates).eq('id', application.id).eq('user_id', authData.user.id);
      if (updateError) throw updateError;
      await syncApplicationReminders(supabase, authData.user.id, application, updates);
      setApplications((current) => current.map((item) => item.id === application.id ? { ...item, ...updates } : item));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Application details could not be saved.');
    }
  }

  async function addManualApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error('Sign in again to add an application.');
      const { data, error: insertError } = await supabase.from('applications').insert({
        user_id: authData.user.id,
        title: manualTitle.trim(),
        employer: manualEmployer.trim(),
        url: manualUrl.trim(),
        closing_on: manualClosingDate || null,
        documents_required: [],
      }).select('*').single();
      if (insertError) throw insertError;
      await syncApplicationReminders(supabase, authData.user.id, data as Application, data as Application);
      setApplications((current) => [data as Application, ...current]);
      setManualTitle('');
      setManualEmployer('');
      setManualUrl('');
      setManualClosingDate('');
      setManualOpen(false);
      setTab('applications');
      setMessage('Application added to your tracker.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The application could not be added.');
    } finally {
      setBusy(false);
    }
  }

  function reminderLabel(item: SavedItem) {
    return item.remind_at ? dateInputValue(item.remind_at) : '';
  }

  if (loading) return <p className="rounded-xl bg-white p-5 text-sm text-slate-600" role="status">Loading My Space…</p>;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-6" aria-label="My Space">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Your personal workspace</p>
          <h2 className="mt-1 text-2xl font-bold text-midnight">My Space</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Keep your next steps, saved resources, and applications together.</p>
        </div>
        {dueCount > 0 && <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-amber-100 px-3 text-sm font-bold text-amber-950"><Bell size={16} aria-hidden="true" />{dueCount} to check</span>}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" role="tablist" aria-label="My Space sections">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-2 text-sm font-semibold ${tab === id ? 'border-midnight bg-midnight text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
            <Icon size={16} aria-hidden="true" />{label}
            {id === 'todo' && dueCount > 0 && <span className="rounded-full bg-amber-200 px-1.5 text-xs text-amber-950">{dueCount}</span>}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
      {message && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900" role="status">{message}</p>}

      {tab === 'todo' && (
        <section className="mt-5" role="tabpanel" aria-label="To do">
          <h3 className="font-bold text-midnight">What needs your attention</h3>
          {todoItems.length === 0 ? <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">Nothing due right now. Start a draft, save something useful, or track an application and it will appear here.</p> : (
            <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
              {todoItems.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-3 p-3">
                  <CalendarDays size={17} className="shrink-0 text-slate-500" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-midnight">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.label} · {dateLabel(item.date)}</p>
                  </div>
                  <Link href={item.href} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-midnight">Continue</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'saved' && (
        <section className="mt-5" role="tabpanel" aria-label="Saved items">
          <h3 className="font-bold text-midnight">Saved for later <span className="font-normal text-slate-500">({savedItems.length})</span></h3>
          {savedItems.length === 0 ? <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">Saved lessons, opportunities, and tools will be collected here.</p> : (
            <ul className="mt-3 space-y-3">
              {savedItems.map((item) => (
                <li key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.item_type.replaceAll('_', ' ')}</p>
                      <h4 className="mt-1 font-bold text-midnight">{item.title}</h4>
                      <p className="mt-1 text-xs text-slate-500">Saved {dateLabel(item.created_at)}</p>
                    </div>
                    <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700" onClick={() => void removeSavedItem(item)} disabled={busy}><Trash2 size={15} aria-hidden="true" />Remove</button>
                  </div>
                  <label className="mt-3 block text-xs font-semibold text-slate-600">
                    Note for later
                    <textarea defaultValue={item.note} maxLength={1000} rows={2} onBlur={(event) => {
                      if (event.currentTarget.value !== item.note) void updateSavedItem(item, { note: event.currentTarget.value });
                    }} className="input mt-1 min-h-11 bg-white text-sm" placeholder="Add a note or question…" />
                  </label>
                  <div className="mt-3 flex flex-wrap items-end gap-3">
                    <label className="block flex-1 text-xs font-semibold text-slate-600">
                      Custom reminder date
                      <input type="date" min={today} value={reminderLabel(item)} onChange={(event) => void updateSavedItem(item, { remind_at: localDateTime(event.target.value) })} className="input mt-1 min-h-11 bg-white text-base" />
                    </label>
                    <Link href={item.link} className="inline-flex min-h-11 items-center gap-1 rounded-lg bg-midnight px-3 text-sm font-semibold text-white">Open <span aria-hidden="true">→</span></Link>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2" aria-label={`Reminder options for ${item.title}`}>
                    <button type="button" onClick={() => void updateSavedItem(item, { remind_at: localDateTime(offsetDate(1)) })} className="min-h-10 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700">Tomorrow</button>
                    <button type="button" onClick={() => void updateSavedItem(item, { remind_at: localDateTime(offsetDate(3)) })} className="min-h-10 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700">In 3 days</button>
                    {item.closing_on && <button type="button" onClick={() => void updateSavedItem(item, { remind_at: localDateTime(beforeClosingDate(item.closing_on)) })} className="min-h-10 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700">Before closing date</button>}
                    {item.remind_at && <button type="button" onClick={() => void updateSavedItem(item, { remind_at: null })} className="min-h-10 px-2 text-xs font-semibold text-slate-600 underline underline-offset-2">Clear reminder</button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'applications' && (
        <section className="mt-5" role="tabpanel" aria-label="Applications">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-midnight">Application tracker</h3>
              <p className="mt-1 text-sm text-slate-600">Track applications you started in Beacon or add one manually.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => exportApplications(applications)} disabled={applications.length === 0} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-midnight disabled:opacity-50"><ArrowDownToLine size={16} aria-hidden="true" />Export CSV</button>
              <button type="button" onClick={() => setManualOpen((current) => !current)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-midnight px-3 text-sm font-semibold text-white"><Plus size={16} aria-hidden="true" />Add application</button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[['Applied this month', thisMonthApplications], ['Interviews', interviews], ['Response rate', `${responseRate}%`]].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-[11px] leading-4 text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-midnight">{value}</p>
              </div>
            ))}
          </div>

          {manualOpen && (
            <form onSubmit={addManualApplication} className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-midnight">Role or opportunity title<input required maxLength={160} value={manualTitle} onChange={(event) => setManualTitle(event.target.value)} className="input mt-1 min-h-11 bg-white text-base" /></label>
              <label className="text-sm font-semibold text-midnight">Employer or institution<input maxLength={160} value={manualEmployer} onChange={(event) => setManualEmployer(event.target.value)} className="input mt-1 min-h-11 bg-white text-base" /></label>
              <label className="text-sm font-semibold text-midnight">Original advert link<input type="url" value={manualUrl} onChange={(event) => setManualUrl(event.target.value)} placeholder="https://" className="input mt-1 min-h-11 bg-white text-base" /></label>
              <label className="text-sm font-semibold text-midnight">Closing date<input type="date" min={today} value={manualClosingDate} onChange={(event) => setManualClosingDate(event.target.value)} className="input mt-1 min-h-11 bg-white text-base" /></label>
              <div className="flex gap-2 sm:col-span-2"><button type="submit" disabled={busy} className="inline-flex min-h-11 items-center rounded-lg bg-midnight px-4 text-sm font-semibold text-white">{busy ? 'Adding…' : 'Add to tracker'}</button><button type="button" onClick={() => setManualOpen(false)} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">Cancel</button></div>
            </form>
          )}

          <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter by application stage">
            <button type="button" onClick={() => setStageFilter('all')} aria-pressed={stageFilter === 'all'} className={`min-h-10 rounded-full border px-3 text-xs font-semibold ${stageFilter === 'all' ? 'border-midnight bg-midnight text-white' : 'border-slate-300 bg-white text-slate-700'}`}>All {applications.length}</button>
            {stages.map((stage) => {
              const count = applications.filter((application) => application.stage === stage).length;
              return <button key={stage} type="button" onClick={() => setStageFilter(stage)} aria-pressed={stageFilter === stage} className={`min-h-10 rounded-full border px-3 text-xs font-semibold ${stageFilter === stage ? 'border-midnight bg-midnight text-white' : 'border-slate-300 bg-white text-slate-700'}`}>{stageLabels[stage]} {count}</button>;
            })}
          </div>

          {visibleApplications.length === 0 ? <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">No applications in this stage yet. Save a listing or add an application from somewhere else.</p> : (
            <ul className="mt-4 space-y-3">
              {visibleApplications.map((application) => (
                <li key={application.id}>
                  <article className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-midnight">{application.title}</h4>
                        <p className="mt-1 text-sm text-slate-600">{application.employer || 'Employer not added'}{application.closing_on ? ` · Closes ${dateLabel(application.closing_on)}` : ''}</p>
                        {application.url && <a href={application.url} target="_blank" rel="noreferrer" className="mt-1 inline-block break-all text-xs font-semibold text-midnight underline">{application.url}</a>}
                      </div>
                      <label className="block min-w-36 text-xs font-semibold text-slate-600">
                        Stage
                        <select value={application.stage} onChange={(event) => void changeStage(application, event.target.value)} className="input mt-1 min-h-11 bg-white text-sm">
                          {stages.map((stage) => <option key={stage} value={stage}>{stageLabels[stage]}</option>)}
                        </select>
                      </label>
                    </div>
                    <details className="mt-3 border-t border-slate-100 pt-3">
                      <summary className="min-h-10 cursor-pointer py-2 text-sm font-semibold text-midnight">Notes, next step &amp; documents</summary>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-xs font-semibold text-slate-600">Next step<input defaultValue={application.next_step} maxLength={500} onBlur={(event) => event.currentTarget.value !== application.next_step && void updateApplication(application, { next_step: event.currentTarget.value })} className="input mt-1 min-h-11 bg-white text-base" placeholder="e.g. Follow up by email" /></label>
                        <label className="text-xs font-semibold text-slate-600">Next step date<input type="date" defaultValue={application.next_step_on || ''} onChange={(event) => void updateApplication(application, { next_step_on: event.target.value || null })} className="input mt-1 min-h-11 bg-white text-base" /></label>
                        <label className="text-xs font-semibold text-slate-600">Date applied<input type="date" defaultValue={application.applied_on || ''} onChange={(event) => void updateApplication(application, { applied_on: event.target.value || null })} className="input mt-1 min-h-11 bg-white text-base" /></label>
                        <label className="text-xs font-semibold text-slate-600">Closing date<input type="date" defaultValue={application.closing_on || ''} onChange={(event) => void updateApplication(application, { closing_on: event.target.value || null })} className="input mt-1 min-h-11 bg-white text-base" /></label>
                        <label className="text-xs font-semibold text-slate-600">CV version<input defaultValue={application.cv_version_id} maxLength={120} onBlur={(event) => event.currentTarget.value !== application.cv_version_id && void updateApplication(application, { cv_version_id: event.currentTarget.value })} className="input mt-1 min-h-11 bg-white text-base" placeholder="e.g. Retail assistant CV" /></label>
                        <label className="text-xs font-semibold text-slate-600">Cover letter<input defaultValue={application.cover_letter_id} maxLength={120} onBlur={(event) => event.currentTarget.value !== application.cover_letter_id && void updateApplication(application, { cover_letter_id: event.currentTarget.value })} className="input mt-1 min-h-11 bg-white text-base" placeholder="e.g. Tailored cover letter" /></label>
                        <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Contact person / email<input defaultValue={application.contact} maxLength={240} onBlur={(event) => event.currentTarget.value !== application.contact && void updateApplication(application, { contact: event.currentTarget.value })} className="input mt-1 min-h-11 bg-white text-base" /></label>
                        <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Private notes<textarea defaultValue={application.notes} maxLength={5000} rows={3} onBlur={(event) => event.currentTarget.value !== application.notes && void updateApplication(application, { notes: event.currentTarget.value })} className="input mt-1 bg-white text-base" /></label>
                        <fieldset className="sm:col-span-2">
                          <legend className="text-xs font-semibold text-slate-600">Documents checklist</legend>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {documentChecklist.map((document) => (
                              <label key={document} className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-700">
                                <input type="checkbox" checked={application.documents_required.includes(document)} onChange={(event) => {
                                  const next = event.target.checked
                                    ? [...application.documents_required, document]
                                    : application.documents_required.filter((item) => item !== document);
                                  void updateApplication(application, { documents_required: next });
                                }} className="h-4 w-4 accent-sunshine-dark" />
                                {document}
                              </label>
                            ))}
                          </div>
                        </fieldset>
                        {application.stage === 'closed' && <label className="text-xs font-semibold text-slate-600">Closed because<select value={application.closed_reason || ''} onChange={(event) => void updateApplication(application, { closed_reason: event.target.value || null })} className="input mt-1 min-h-11 bg-white text-sm"><option value="">Choose if known</option><option value="not_selected">Not selected</option><option value="withdrawn">Withdrawn</option></select></label>}
                      </div>
                      {(application.next_step_on || application.closing_on) && <button type="button" onClick={() => downloadCalendarEvent(application)} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-midnight"><CalendarDays size={16} aria-hidden="true" />Add deadline to calendar</button>}
                    </details>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'documents' && (
        <section className="mt-5" role="tabpanel" aria-label="Documents">
          <h3 className="font-bold text-midnight">Your application documents</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Your CV draft is stored in your account and can be opened or downloaded from the CV builder. Document uploads and a private document vault are scheduled for Phase 2.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/app/employment/cv" className="rounded-xl border border-slate-200 p-4 hover:bg-slate-50"><FileText size={20} aria-hidden="true" /><span className="mt-2 block font-semibold text-midnight">Open CV builder</span><span className="mt-1 block text-xs text-slate-500">Continue editing or export your CV</span></Link>
            <Link href="/app/passport" className="rounded-xl border border-slate-200 p-4 hover:bg-slate-50"><FolderOpen size={20} aria-hidden="true" /><span className="mt-2 block font-semibold text-midnight">Open Skills Passport</span><span className="mt-1 block text-xs text-slate-500">Review your shareable work portfolio</span></Link>
          </div>
        </section>
      )}

      {tab === 'drafts' && (
        <section className="mt-5" role="tabpanel" aria-label="Drafts">
          <h3 className="font-bold text-midnight">Your unfinished work <span className="font-normal text-slate-500">({drafts.length})</span></h3>
          {drafts.length === 0 ? <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">When you start a CV, pathway, or idea, your saved draft will appear here so you can resume it.</p> : (
            <ul className="mt-3 space-y-3">
              {drafts.map((draft) => (
                <li key={draft.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h4 className="font-bold text-midnight">{draft.title}</h4><p className="mt-1 text-xs text-slate-500">Updated {dateLabel(draft.updated_at)} · Expires {dateLabel(draft.expires_at)}</p></div>
                    <span className="text-sm font-bold text-midnight">{draft.progress}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${draft.title} completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={draft.progress}><div className="h-full rounded-full bg-emerald-600" style={{ width: `${draft.progress}%` }} /></div>
                  <Link href={draftPaths[draft.kind] || '/app/profile'} className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-midnight px-3 text-sm font-semibold text-white">Continue draft</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </section>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OpportunityFeed } from '@/components/OpportunityFeed';
import { DashboardNotifications } from '@/components/DashboardNotifications';
import { getSupabase } from '@/lib/supabase';
import { PageIntro } from '@/components/PageIntro';
import { useForge } from '@/components/ForgeContext';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

type CurrentUser = { id: string };

const starterActions = [
  { id: 'profile', label: 'Add your skills and experience' },
  { id: 'budget', label: 'Set a monthly savings goal' },
  { id: 'idea', label: 'Write down one business idea to test' },
];

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateFromKey(value: string): Date {
  return new Date(`${value}T12:00:00`);
}

function DashboardApplicationCalendar({ actions }: { actions: ReturnType<typeof useForge>['actions'] }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(new Date()));
  const today = localDateKey(new Date());
  const saved = actions.filter((action) => action.status === 'saved');
  const events = saved.flatMap((action) => [
    ...(action.scheduled_apply_date ? [{ id: `${action.opportunity_id}-return`, date: action.scheduled_apply_date, kind: 'Come back to apply' }] : []),
    ...(action.opportunities.closing_date ? [{ id: `${action.opportunity_id}-closing`, date: action.opportunities.closing_date, kind: 'Advert closes' }] : []),
  ].map((event) => ({ ...event, title: action.opportunities.title, organization: action.opportunities.organization })));
  const monthLength = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const selectedEvents = events.filter((event) => event.date === selectedDate);
  const dueSaved = saved
    .filter((action) => action.scheduled_apply_date)
    .sort((left, right) => (left.scheduled_apply_date || '').localeCompare(right.scheduled_apply_date || ''));
  const overdueCount = dueSaved.filter((action) => (action.scheduled_apply_date || '') < today).length;
  const todayCount = dueSaved.filter((action) => action.scheduled_apply_date === today).length;

  return (
    <section className="mb-8 border-y border-slate-200 py-5" aria-labelledby="dashboard-calendar-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Your saved posts</p>
          <h2 id="dashboard-calendar-heading" className="mt-1 text-xl font-semibold text-midnight">Application calendar</h2>
          <p className="mt-1 text-sm text-slate-600">Return dates and closing dates for opportunities you saved.</p>
        </div>
        <Link href="/app/profile" className="link text-sm">Manage in profile planner</Link>
      </div>

      {saved.length === 0 && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <p className="text-sm text-slate-600">Save an opportunity to plan when you want to return to it.</p>
        <Link href="/app/employment/opportunities" className="btn-secondary min-h-10">Browse opportunities</Link>
      </div>}
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)]">
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-semibold text-midnight"><CalendarDays size={17} aria-hidden="true" />{new Intl.DateTimeFormat('en-ZA', { month: 'long', year: 'numeric' }).format(month)}</h3>
              <div className="flex gap-1">
                <button type="button" className="btn-secondary min-h-9 px-2" aria-label="Previous month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}><ChevronLeft size={17} aria-hidden="true" /></button>
                <button type="button" className="btn-secondary min-h-9 px-2" aria-label="Next month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}><ChevronRight size={17} aria-hidden="true" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 border-l border-t border-slate-200" role="grid" aria-label="Saved opportunity dates">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="border-b border-r border-slate-200 bg-slate-50 py-2 text-center text-[10px] font-semibold text-slate-500 sm:text-xs" role="columnheader">{day}</div>)}
              {Array.from({ length: offset }, (_, index) => <div key={`empty-${index}`} className="min-h-11 border-b border-r border-slate-200 bg-slate-50/50 sm:min-h-14" aria-hidden="true" />)}
              {Array.from({ length: monthLength }, (_, index) => {
                const date = localDateKey(new Date(month.getFullYear(), month.getMonth(), index + 1));
                const count = events.filter((event) => event.date === date).length;
                const selected = selectedDate === date;
                return <button key={date} type="button" role="gridcell" aria-pressed={selected} aria-label={`${new Intl.DateTimeFormat('en-ZA', { dateStyle: 'full' }).format(dateFromKey(date))}${count ? `, ${count} saved opportunity dates` : ''}`} onClick={() => setSelectedDate(date)} className={`min-h-11 border-b border-r border-slate-200 p-1 text-left sm:min-h-14 sm:p-2 ${selected ? 'bg-sunshine-light' : 'bg-white hover:bg-slate-50'}`}>
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${date === today ? 'bg-midnight font-bold text-white' : 'text-slate-700'}`}>{index + 1}</span>
                  {count > 0 && <span className="mt-1 block text-[9px] font-bold text-emerald-800">{count} item{count === 1 ? '' : 's'}</span>}
                </button>;
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
              <span><strong className="text-red-800">{overdueCount}</strong> overdue</span>
              <span><strong className="text-amber-800">{todayCount}</strong> due today</span>
              <span>{dueSaved.length - overdueCount - todayCount} upcoming</span>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0" aria-live="polite">
            <h3 className="font-semibold text-midnight">{new Intl.DateTimeFormat('en-ZA', { dateStyle: 'full' }).format(dateFromKey(selectedDate))}</h3>
            {selectedEvents.length === 0 ? <p className="mt-3 text-sm leading-6 text-slate-600">No saved return or closing dates on this day.</p> : <ul className="mt-2 divide-y divide-slate-200">
              {selectedEvents.map((event) => <li key={event.id} className="py-3"><p className="text-[11px] font-semibold uppercase text-slate-500">{event.kind}</p><p className="mt-1 text-sm font-semibold text-midnight">{event.title}</p><p className="text-xs text-slate-600">{event.organization}</p></li>)}
            </ul>}
            {dueSaved.length > 0 && <div className="mt-3 border-t border-slate-200 pt-3">
              <h4 className="text-xs font-bold uppercase text-slate-500">Next return dates</h4>
              <ul className="mt-1 divide-y divide-slate-100">
                {dueSaved.slice(0, 4).map((action) => {
                  const date = action.scheduled_apply_date || '';
                  const status = date < today ? 'Overdue' : date === today ? 'Due today' : 'Upcoming';
                  return <li key={action.opportunity_id} className="py-2"><div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-midnight">{action.opportunities.title}</p><span className={`shrink-0 text-[10px] font-bold ${status === 'Overdue' ? 'text-red-800' : status === 'Due today' ? 'text-amber-800' : 'text-slate-500'}`}>{status}</span></div><p className="mt-0.5 text-xs text-slate-600">{date ? new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)) : ''}</p></li>;
                })}
              </ul>
            </div>}
          </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const forge = useForge();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [completed, setCompleted] = useState<string[]>([]);
  const [storageWarning, setStorageWarning] = useState('');
  const [authUnavailable, setAuthUnavailable] = useState(false);
  const progress = Math.round((completed.length / starterActions.length) * 100);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      try {
        const supabase = getSupabase();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          router.replace('/login');
          return;
        }
        if (active) {
          setUser({ id: authData.user.id });
        }
        const progressResult = await supabase.from('learner_progress').select('checklist').maybeSingle();
        if (progressResult.error) {
          if (active) setStorageWarning('Your progress could not be loaded. Check that the Supabase migrations are applied.');
        } else if (active) {
          const checklist = Array.isArray(progressResult.data?.checklist) ? progressResult.data.checklist as string[] : [];
          setCompleted(checklist.filter((id) => starterActions.some((action) => action.id === id)));
        }
      } catch {
        if (active) setAuthUnavailable(true);
      } finally {
        if (active) setCheckingSession(false);
      }
    }
    void loadDashboard();
    return () => { active = false; };
  }, [router]);

  function toggleAction(id: string) {
    if (!user) return;
    const updated = completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id];
    setCompleted(updated);
    getSupabase().from('learner_progress').upsert({ user_id: user.id, checklist: updated }, { onConflict: 'user_id' })
      .then(({ error }) => {
        if (error) setStorageWarning('Your change could not be saved. Check the Supabase data setup.');
        else setStorageWarning('');
      });
  }

  if (authUnavailable) {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 sm:px-6 lg:px-8" role="alert">Authentication is unavailable. Check the Supabase configuration and try again.</div>;
  }
  if (checkingSession || !user) {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 sm:px-6 lg:px-8" role="status">Checking your session...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro
        eyebrow="Your learner workspace"
        title={`${greeting}, ${forge.firstName || 'there'}`}
        description={`${forge.stage}. One useful next step is enough for today.`}
        actions={<>
          <DashboardNotifications userId={user.id} />
          <Link href="/app/profile" className="btn-secondary min-h-10 w-full sm:w-auto">Edit profile</Link>
        </>}
      />

      <section className="mb-7 border-y border-slate-200 bg-sunshine-light/40 px-4 py-5 sm:px-6" aria-labelledby="next-action-heading">
        <p className="eyebrow">Your next step · {forge.stage}</p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 id="next-action-heading" className="text-xl font-semibold text-midnight">
              {forge.preferences.personalisation_paused ? 'Choose a small step for today' : forge.nextAction?.label || 'Pick one step that feels useful today'}
            </h2>
            <details className="mt-2 text-sm text-slate-600">
              <summary className="min-h-8 cursor-pointer font-medium text-midnight underline underline-offset-2">Why am I seeing this?</summary>
              <p className="mt-1 max-w-2xl leading-6">
                {forge.preferences.personalisation_paused
                  ? 'Personalisation is paused, so this suggestion is not based on your profile or activity.'
                  : forge.nextAction?.reason || 'No open action is recorded, so this page leaves the choice with you.'}
              </p>
            </details>
          </div>
          <Link href={forge.preferences.personalisation_paused ? '/app/employment/opportunities' : forge.nextAction?.href || '/app/employment/opportunities'} className="btn-primary w-full shrink-0 sm:w-auto">
            {forge.preferences.personalisation_paused ? 'Explore opportunities' : 'Take this step'} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {forge.recentWin && <p className="mb-6 text-sm text-emerald-dark" role="status">Latest recorded win: {forge.recentWin}</p>}

      <DashboardApplicationCalendar actions={forge.actions} />

      <section className="mb-8 rounded-2xl border border-[#e5e5e5] bg-white p-4 sm:p-6" aria-labelledby="matches-heading">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <p className="eyebrow">Opportunity connector</p>
            <h2 id="matches-heading" className="section-heading mt-2">Your matches today</h2>
            <p className="section-description">Explore verified listings and choose the ones that fit your next step.</p>
          </div>
          <Link href="/app/employment/opportunities" className="link text-sm">See all opportunities</Link>
        </div>
        <div className="mt-6 border-t border-[#e5e5e5] pt-5">
          <OpportunityFeed />
        </div>
      </section>

      <div className="grid items-start gap-5 py-5 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-6 md:py-7">
        <section className="rounded-2xl border border-[#e5e5e5] bg-surface p-5 shadow-card sm:p-6" aria-labelledby="actions-heading">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 id="actions-heading" className="section-heading">Your starter plan</h2>
              <p className="mt-2 text-sm leading-6 text-[#555555]">Three small actions across your development goals.</p>
            </div>
            <span className="text-sm font-semibold text-emerald-dark">{completed.length} of {starterActions.length} complete</span>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Starter plan progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="h-full bg-sunshine-dark transition-[width]" style={{ width: `${progress}%` }} />
          </div>
          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {starterActions.map((action, index) => (
              <li key={action.id} className="py-4">
                <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={completed.includes(action.id)}
                    onChange={() => toggleAction(action.id)}
                    className="mt-0.5 h-5 w-5 accent-sunshine-dark"
                  />
                  <span className="flex-1">
                    <span className="block font-medium text-midnight">{action.label}</span>
                    <span className="mt-1 block text-xs text-slate-500">{['Employment readiness', 'Money confidence', 'Growth potential'][index]}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-6 rounded-2xl border border-[#e5e5e5] bg-[#f7f7f7] p-5 sm:p-6">
          <section aria-labelledby="mobility-score-heading">
            <p className="eyebrow">Economic Mobility Score</p>
            <h2 id="mobility-score-heading" className="mt-2 text-xl font-bold text-midnight">Not calculated</h2>
            <p className="mt-2 text-sm leading-6 text-[#555555]">The score needs the employment, money, and growth tools, which are not included in this source upload.</p>
          </section>
          <section aria-labelledby="progress-heading">
            <p className="eyebrow">Starter plan progress</p>
            <h2 id="progress-heading" className="mt-2 text-3xl font-bold text-midnight">{progress}%</h2>
            <p className="mt-2 text-sm leading-6 text-[#555555]">Completion of the three checklist actions shown here.</p>
          </section>
          <section id="money-skills" className="border-t border-slate-200 pt-5">
            <h2 className="font-semibold text-midnight">Money confidence</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Set a savings goal and practice everyday money decisions.</p>
          </section>
          <section id="growth-studio" className="border-t border-slate-200 pt-5">
            <h2 className="font-semibold text-midnight">Growth potential</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Capture an idea and choose one small experiment.</p>
          </section>
        </aside>
      </div>
      {storageWarning && <p role="status" className="mb-4 text-sm text-amber-800">{storageWarning}</p>}
      <p className="border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
        Your checklist is saved to your account. Only you can access your learner progress.
      </p>
    </div>
  );
}
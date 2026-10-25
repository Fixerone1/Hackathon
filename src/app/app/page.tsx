'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OpportunityFeed } from '@/components/OpportunityFeed';
import { DashboardNotifications } from '@/components/DashboardNotifications';
import { getSupabase } from '@/lib/supabase';
import { useForge } from '@/components/ForgeContext';
import { ArrowRight, Banknote, BookOpen, BriefcaseBusiness, CalendarDays, ChevronLeft, ChevronRight, ClipboardCheck, Compass, FileText, GraduationCap, Lightbulb, Route, Sparkles, type LucideIcon } from 'lucide-react';

type CurrentUser = { id: string };
type HomeFocus = 'all' | 'study' | 'work' | 'business' | 'money';

const focusDetails: Record<HomeFocus, { label: string; message: string; Icon: typeof Compass }> = {
  all: { label: 'Your next step', message: 'Choose what feels useful today. Your plan can change whenever you do.', Icon: Compass },
  study: { label: 'Study and learning', message: 'Your workspace is centred on learning routes, skills, and study opportunities.', Icon: GraduationCap },
  work: { label: 'Work and opportunities', message: 'Your workspace is centred on building work readiness and tracking opportunities.', Icon: BriefcaseBusiness },
  business: { label: 'Business ideas', message: 'Your workspace is centred on testing ideas and finding practical next moves.', Icon: Lightbulb },
  money: { label: 'Money confidence', message: 'Your workspace is centred on everyday money skills and steady progress.', Icon: Banknote },
};

const starterActions = [
  { id: 'profile', label: 'Add your skills and experience' },
  { id: 'budget', label: 'Set a monthly savings goal' },
  { id: 'idea', label: 'Write down one business idea to test' },
];

const focusLinks: Record<HomeFocus, Array<{ title: string; description: string; href: string; Icon: LucideIcon }>> = {
  all: [
    { title: 'Explore opportunities', description: 'Review current verified listings.', href: '/app/employment/opportunities', Icon: BriefcaseBusiness },
    { title: 'Update your profile', description: 'Make your matches more useful.', href: '/app/profile', Icon: ClipboardCheck },
  ],
  study: [
    { title: 'Study pathways', description: 'Compare routes towards further study.', href: '/app/employment/pathways', Icon: Route },
    { title: 'Skills Academy', description: 'Find a practical skill to build.', href: '/app/employment/academy', Icon: BookOpen },
  ],
  work: [
    { title: 'Opportunity matches', description: 'Review verified openings and dates.', href: '/app/employment/opportunities', Icon: BriefcaseBusiness },
    { title: 'My applications', description: 'Pick up where you left off.', href: '/app/employment/applications', Icon: ClipboardCheck },
  ],
  business: [
    { title: 'Growth Studio', description: 'Shape an idea into a small test.', href: '/app/growth', Icon: Lightbulb },
    { title: 'Study and career paths', description: 'Explore routes that support your plan.', href: '/app/employment/pathways', Icon: Route },
  ],
  money: [
    { title: 'Money Skills', description: 'Explore everyday money decisions.', href: '/app/money', Icon: Banknote },
    { title: 'Starter plan', description: 'Review your saved next steps.', href: '/app#actions-heading', Icon: FileText },
  ],
};
function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateFromKey(value: string): Date {
  return new Date(`${value}T12:00:00`);
}

function DashboardApplicationCalendar({ actions }: { actions: ReturnType<typeof useForge>['actions'] }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(new Date()));
  const [locale, setLocale] = useState('en-ZA');
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.language) setLocale(navigator.language);
  }, []);
  const today = localDateKey(new Date());
  const saved = actions.filter((action) => action.status === 'saved');
  const events = saved.flatMap((action) => [
    ...(action.scheduled_apply_date ? [{ id: `${action.opportunity_id}-return`, date: action.scheduled_apply_date, kind: 'Come back to apply' }] : []),
    ...(action.opportunities.closing_date ? [{ id: `${action.opportunity_id}-closing`, date: action.opportunities.closing_date, kind: 'Advert closes' }] : []),
  ].map((event) => ({ ...event, title: action.opportunities.title, organization: action.opportunities.organization })));
  const monthLength = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const region = locale.split('-')[1]?.toUpperCase();
  const sundayFirstRegions = new Set(['US', 'CA', 'JP', 'MX', 'BR', 'PH', 'IL']);
  const weekStart = sundayFirstRegions.has(region || '') ? 0 : 1;
  const offset = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() - weekStart + 7) % 7;
  const selectedEvents = events.filter((event) => event.date === selectedDate);
  const dueSaved = saved
    .filter((action) => action.scheduled_apply_date)
    .sort((left, right) => (left.scheduled_apply_date || '').localeCompare(right.scheduled_apply_date || ''));
  const overdueCount = dueSaved.filter((action) => (action.scheduled_apply_date || '') < today).length;
  const todayCount = dueSaved.filter((action) => action.scheduled_apply_date === today).length;

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card" aria-labelledby="dashboard-calendar-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black px-5 py-4 text-white sm:px-6">
        <div>
          <p className="text-xs font-bold uppercase text-yellow-300">Your saved opportunities</p>
          <h2 id="dashboard-calendar-heading" className="mt-1 text-xl font-semibold text-white">Application calendar</h2>
          <p className="mt-1 text-sm text-slate-300">Return dates and closing dates, in your local time.</p>
        </div>
        <Link href="/app/profile" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/30 px-3 text-sm font-semibold text-white hover:border-yellow-300 hover:bg-white/10">Open full planner <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>

      {saved.length === 0 && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <p className="text-sm text-slate-600">Save an opportunity to plan when you want to return to it.</p>
        <Link href="/app/employment/opportunities" className="btn-secondary min-h-10">Browse opportunities</Link>
      </div>}
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(17rem,0.9fr)]">
        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 font-semibold text-black"><CalendarDays size={18} aria-hidden="true" />{new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(month)}</h3>
            <div className="flex gap-1">
              <button type="button" className="btn-secondary min-h-9 px-2" aria-label="Previous month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}><ChevronLeft size={17} aria-hidden="true" /></button>
              <button type="button" className="btn-secondary min-h-9 px-2" aria-label="Next month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}><ChevronRight size={17} aria-hidden="true" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Saved opportunity dates">
            {Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2023, 0, 1 + weekStart + index))).map((day) => <div key={day} className="pb-1 text-center text-[10px] font-bold uppercase text-slate-500 sm:text-xs" role="columnheader">{day}</div>)}
            {Array.from({ length: offset }, (_, index) => <div key={`empty-${index}`} className="min-h-11 sm:min-h-14" aria-hidden="true" />)}
            {Array.from({ length: monthLength }, (_, index) => {
              const date = localDateKey(new Date(month.getFullYear(), month.getMonth(), index + 1));
              const dateEvents = events.filter((event) => event.date === date);
              const selected = selectedDate === date;
              return <button key={date} type="button" role="gridcell" aria-pressed={selected} aria-label={`${new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(dateFromKey(date))}${dateEvents.length ? `, ${dateEvents.length} saved opportunity dates` : ''}`} onClick={() => setSelectedDate(date)} className={`flex min-h-11 flex-col items-center justify-center rounded-xl p-1 transition-colors sm:min-h-14 ${selected ? 'bg-yellow text-black shadow-sm' : date === today ? 'bg-black text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                <span className="text-xs font-semibold sm:text-sm">{index + 1}</span>
                <span className="mt-1 flex h-1.5 gap-0.5">
                  {dateEvents.slice(0, 3).map((event) => <span key={event.id} className={`h-1.5 w-1.5 rounded-full ${event.kind === 'Come back to apply' ? 'bg-yellow-700' : 'bg-slate-500'}`} />)}
                </span>
              </button>;
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 pt-3 text-xs text-slate-600">
            <span className="font-semibold"><strong className="text-red-700">{overdueCount}</strong> overdue</span>
            <span className="font-semibold"><strong className="text-yellow-800">{todayCount}</strong> due today</span>
            <span>{dueSaved.length - overdueCount - todayCount} upcoming</span>
            <span className="ml-auto inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-yellow-700" />Return date <span className="ml-2 h-1.5 w-1.5 rounded-full bg-slate-500" />Closing date</span>
          </div>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5" aria-live="polite">
          <p className="text-xs font-bold uppercase text-slate-500">Selected day</p>
          <h3 className="mt-1 font-semibold text-black">{new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(dateFromKey(selectedDate))}</h3>
          {selectedEvents.length === 0 ? <p className="mt-3 text-sm leading-6 text-slate-600">Nothing saved for this day. Choose another date or add a return date to one of your saved posts.</p> : <ul className="mt-3 divide-y divide-slate-200">
            {selectedEvents.map((event) => <li key={event.id} className="flex gap-3 py-3"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${event.kind === 'Come back to apply' ? 'bg-yellow-600' : 'bg-slate-500'}`} /><div><p className="text-[10px] font-bold uppercase text-slate-500">{event.kind}</p><p className="mt-1 text-sm font-semibold text-black">{event.title}</p><p className="text-xs text-slate-600">{event.organization}</p></div></li>)}
          </ul>}
          {dueSaved.length > 0 && <div className="mt-4 border-t border-slate-200 pt-3">
            <h4 className="text-xs font-bold uppercase text-slate-500">Next return dates</h4>
            <ul className="mt-1 divide-y divide-slate-200">
              {dueSaved.slice(0, 4).map((action) => {
                const date = action.scheduled_apply_date || '';
                const status = date < today ? 'Overdue' : date === today ? 'Due today' : 'Upcoming';
                return <li key={action.opportunity_id} className="py-2"><div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-black">{action.opportunities.title}</p><span className={`shrink-0 text-[10px] font-bold ${status === 'Overdue' ? 'text-red-700' : status === 'Due today' ? 'text-yellow-800' : 'text-slate-500'}`}>{status}</span></div><p className="mt-0.5 text-xs text-slate-600">{date ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(dateFromKey(date)) : ''}</p></li>;
              })}
            </ul>
          </div>}
          <Link href="/app/profile" className="link mt-4 inline-flex text-sm">Manage dates</Link>
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
  const [homeFocus, setHomeFocus] = useState<HomeFocus>('all');
  const progress = Math.round((completed.length / starterActions.length) * 100);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const focusDetail = focusDetails[homeFocus];
  const FocusIcon = focusDetail.Icon;
  const focusAction = homeFocus === 'all'
    ? { label: forge.nextAction?.label || 'Choose your next step', href: forge.nextAction?.href || '/app/employment/opportunities' }
    : homeFocus === 'study'
      ? { label: 'Explore study pathways', href: '/app/employment/pathways' }
      : homeFocus === 'work'
        ? { label: 'View opportunity matches', href: '/app/employment/opportunities' }
        : homeFocus === 'business'
          ? { label: 'Develop a business idea', href: '/app/growth' }
          : { label: 'Explore money skills', href: '/app/money' };

  function changeFocus(focus: HomeFocus) {
    setHomeFocus(focus);
    localStorage.setItem('careerforge-home-focus', focus);
  }

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      try {
        const storedFocus = localStorage.getItem('careerforge-home-focus');
        if (storedFocus === 'study' || storedFocus === 'work' || storedFocus === 'business' || storedFocus === 'money') setHomeFocus(storedFocus);
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
      <div className="mb-4 flex justify-end gap-2">
          <DashboardNotifications userId={user.id} />
          <Link href="/app/profile" className="btn-secondary min-h-10 w-full sm:w-auto">Edit profile</Link>
      </div>

      <section className="relative mb-7 overflow-hidden rounded-2xl bg-black p-4 text-white shadow-card sm:p-6 lg:p-8" aria-labelledby="dashboard-heading">
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/careerforge-people.jpg`}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[60%_center] opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/55" aria-hidden="true" />
        <div className="relative grid items-center gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.75fr)] lg:gap-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-yellow-300"><FocusIcon size={14} aria-hidden="true" />{focusDetail.label} · {forge.stage}</p>
            <h1 id="dashboard-heading" className="mt-3 text-2xl font-bold leading-tight text-white sm:mt-4 sm:text-3xl lg:text-4xl">{greeting}, {forge.firstName || 'there'}.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">{focusDetail.message}</p>
            <p className="mt-2 text-sm font-medium text-yellow-300">{progress}% of your starter plan complete</p>
            <div className="mt-4" role="group" aria-label="Choose what you want to focus on">
              <p className="mb-2 text-xs font-semibold text-slate-300">What matters to you right now?</p>
              <div className="flex flex-wrap gap-2">
                {([
                  ['all', 'All'], ['study', 'Study'], ['work', 'Work'], ['business', 'Business'], ['money', 'Money'],
                ] as const).map(([focus, label]) => <button key={focus} type="button" aria-pressed={homeFocus === focus} onClick={() => changeFocus(focus)} className={`min-h-10 rounded-full border px-3 text-xs font-semibold transition ${homeFocus === focus ? 'border-yellow bg-yellow text-black' : 'border-white/25 bg-white/5 text-white hover:border-yellow/70 hover:bg-white/10'}`}>{label}</button>)}
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link href={forge.preferences.personalisation_paused && homeFocus === 'all' ? '/app/employment/opportunities' : focusAction.href} className="btn-accent w-full sm:w-auto">
                {forge.preferences.personalisation_paused && homeFocus === 'all' ? 'Explore opportunities' : focusAction.label} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <aside className="rounded-xl border border-white/15 bg-white/[0.08] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase text-yellow-300">One useful action</p>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-yellow text-black"><Sparkles size={17} aria-hidden="true" /></span>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-white">
              {forge.preferences.personalisation_paused ? 'Pick a small step that suits you' : forge.nextAction?.label || 'Pick a small step that suits you'}
            </h2>
            <details className="mt-3 text-sm text-slate-300">
              <summary className="min-h-8 cursor-pointer font-medium text-white underline underline-offset-2">Why this suggestion?</summary>
              <p className="mt-2 leading-6">
                {forge.preferences.personalisation_paused
                  ? 'Personalisation is paused, so this suggestion is not based on your profile or saved activity.'
                  : forge.nextAction?.reason || 'No open action is recorded, so the choice stays with you.'}
              </p>
            </details>
          </aside>
        </div>
      </section>

      {forge.recentWin && <p className="mb-6 text-sm text-emerald-dark" role="status">Latest recorded win: {forge.recentWin}</p>}

      <DashboardApplicationCalendar actions={forge.actions} />

      <section className="mb-8" aria-labelledby="focus-tools-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="eyebrow">Chosen for you</p>
            <h2 id="focus-tools-heading" className="mt-1 text-lg font-semibold text-black">{focusDetail.label}</h2>
          </div>
          <Link href="/app/settings" className="link text-sm">Personalize home</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {focusLinks[homeFocus].map(({ title, description, href, Icon }) => <Link key={href} href={href} className="group flex min-h-24 items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-yellow-700 hover:shadow-card">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-yellow text-black"><Icon size={19} aria-hidden="true" /></span>
            <span className="min-w-0 flex-1"><span className="block font-semibold text-black">{title}</span><span className="mt-1 block text-sm text-slate-600">{description}</span></span>
            <ArrowRight size={17} className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>)}
        </div>
      </section>

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
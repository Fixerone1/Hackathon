'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublishedSiteContent } from '@/components/PublishedSiteContent';
import { useForge } from '@/components/ForgeContext';
import { getSupabase } from '@/lib/supabase';
import { ArrowRight, Banknote, BriefcaseBusiness, CalendarDays, Compass, GraduationCap, Lightbulb, Sparkles } from 'lucide-react';

type HomeFocus = 'all' | 'study' | 'work' | 'business' | 'money';
type StarterAction = { id: string; label: string; area: string; href: string };

const starterActions: StarterAction[] = [
  { id: 'profile', label: 'Add your skills and experience', area: 'Work', href: '/app/profile' },
  { id: 'budget', label: 'Set a monthly savings goal', area: 'Money Skills', href: '/app/money' },
  { id: 'idea', label: 'Write down one business idea to test', area: 'Growth Studio', href: '/app/growth' },
];

const focusOptions: { value: HomeFocus; label: string; href: string; Icon: typeof Compass }[] = [
  { value: 'all', label: 'Everything', href: '/app/study', Icon: Compass },
  { value: 'study', label: 'Study', href: '/app/study', Icon: GraduationCap },
  { value: 'work', label: 'Work', href: '/app/employment', Icon: BriefcaseBusiness },
  { value: 'money', label: 'Money Skills', href: '/app/money', Icon: Banknote },
  { value: 'business', label: 'Growth Studio', href: '/app/growth', Icon: Lightbulb },
];

const topicTips: Record<HomeFocus, { text: string; otherLabel: string; otherHref: string }> = {
  all: { text: 'Small, steady steps count. Choose one useful action today and come back to the rest when you’re ready.', otherLabel: 'Explore Study', otherHref: '/app/study' },
  study: { text: 'Before applying for funding, check the official provider’s deadline, eligibility rules, and required documents.', otherLabel: 'Try Money Skills', otherHref: '/app/money' },
  work: { text: 'Tailor your CV to the role and use examples that show what you did, not just your responsibilities.', otherLabel: 'Explore Study pathways', otherHref: '/app/employment/pathways' },
  money: { text: 'Tracking a few everyday expenses for a week can help you make a budget that reflects your real routine.', otherLabel: 'Explore Growth Studio', otherHref: '/app/growth' },
  business: { text: 'Before spending money on an idea, ask a few potential customers what they need and what they use now.', otherLabel: 'Explore Work opportunities', otherHref: '/app/employment/opportunities' },
};

function validFocus(value: string | null): value is HomeFocus {
  return value === 'all' || value === 'study' || value === 'work' || value === 'business' || value === 'money';
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`));
}

export default function DashboardPage() {
  const router = useRouter();
  const forge = useForge();
  const [checkingSession, setCheckingSession] = useState(true);
  const [completed, setCompleted] = useState<string[]>([]);
  const [storageWarning, setStorageWarning] = useState('');
  const [authUnavailable, setAuthUnavailable] = useState(false);
  const [homeFocus, setHomeFocus] = useState<HomeFocus>('all');
  const [saving, setSaving] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const focusOption = focusOptions.find((option) => option.value === homeFocus) || focusOptions[0];
  const FocusIcon = focusOption.Icon;
  const tip = topicTips[homeFocus];
  const progressCount = `${completed.length} of ${starterActions.length}`;
  const savedCount = forge.actions.filter((action) => action.status === 'saved').length;
  const appliedCount = forge.actions.filter((action) => action.status === 'applied').length;
  const profileSections = [
    Boolean(forge.profile.highest_qualification),
    Boolean(forge.profile.field_of_study || forge.profile.subjects?.length),
    Boolean(forge.profile.province),
    Boolean(forge.profile.target_role),
    Boolean(forge.profile.skills?.length || forge.profile.skill_ratings?.length),
    Boolean(forge.profile.personal_goal),
  ];
  const profileProgress = Math.round(profileSections.filter(Boolean).length * 100 / profileSections.length);
  const today = localDateKey(new Date());
  const nextDeadline = forge.actions
    .filter((action) => action.status === 'saved')
    .flatMap((action) => [
      ...(action.scheduled_apply_date && action.scheduled_apply_date >= today
        ? [{ date: action.scheduled_apply_date, label: 'Your reminder', title: action.opportunities.title }]
        : []),
      ...(action.opportunities.closing_date && action.opportunities.closing_date >= today
        ? [{ date: action.opportunities.closing_date, label: 'Closing date', title: action.opportunities.title }]
        : []),
    ])
    .sort((left, right) => left.date.localeCompare(right.date))[0];
  const shouldUseForgeAction = Boolean(forge.nextAction && (
    forge.nextAction.href === '/app/employment/applications'
    || (homeFocus === 'all' && !forge.preferences.personalisation_paused)
  ));
  const nextAction = shouldUseForgeAction && forge.nextAction
    ? forge.nextAction
    : homeFocus === 'all'
      ? { label: 'Start with Study', reason: 'Study is one useful place to begin. You can explore work, money skills, and business ideas here too.', href: '/app/study' }
      : { label: `Explore ${focusOption.label}`, reason: tip.text, href: focusOption.href };

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      try {
        const storedFocus = localStorage.getItem('careerforge-home-focus');
        if (validFocus(storedFocus) && active) setHomeFocus(storedFocus);
        const supabase = getSupabase();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          router.replace('/login');
          return;
        }
        const progressResult = await supabase.from('learner_progress').select('checklist').maybeSingle();
        if (progressResult.error) {
          if (active) setStorageWarning('Your checklist could not be loaded. Check that the Supabase migrations are applied.');
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

  function changeFocus(focus: HomeFocus) {
    setHomeFocus(focus);
    localStorage.setItem('careerforge-home-focus', focus);
  }

  async function toggleAction(id: string) {
    if (!forge.userId || saving) return;
    const updated = completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id];
    setCompleted(updated);
    setSaving(true);
    setStorageWarning('');
    try {
      const { error } = await getSupabase().from('learner_progress').upsert(
        { user_id: forge.userId, checklist: updated },
        { onConflict: 'user_id' },
      );
      if (error) throw error;
    } catch (caught) {
      setCompleted(completed);
      setStorageWarning(caught instanceof Error ? `Your checklist change could not be saved: ${caught.message}` : 'Your checklist change could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  if (authUnavailable) {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 sm:px-6 lg:px-8" role="alert">Authentication is unavailable. Check the Supabase configuration and try again.</div>;
  }
  if (checkingSession || !forge.userId) {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 sm:px-6 lg:px-8" role="status">Checking your session...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 text-black shadow-card sm:p-7 lg:p-8" aria-labelledby="dashboard-heading">
        <div className="relative grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"><FocusIcon size={14} aria-hidden="true" />{focusOption.label} · {forge.stage}</p>
            <h1 id="dashboard-heading" className="mt-4 text-3xl font-bold leading-tight text-black sm:text-4xl">{greeting}, {forge.firstName || 'there'}.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">Pick up where you left off. Here’s one useful next step, with room to explore other interests too.</p>
            {forge.recentWin && <p className="mt-4 inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900" role="status"><strong className="mr-1">Nice progress.</strong>{forge.recentWin}</p>}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <label htmlFor="home-focus" className="text-sm font-semibold text-slate-700">Your current focus</label>
              <select id="home-focus" className="input min-h-10 w-full sm:w-auto sm:min-w-44" value={homeFocus} onChange={(event) => changeFocus(event.target.value as HomeFocus)}>
                {focusOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>
          <aside className="rounded-xl border border-black/10 bg-white/80 p-4 shadow-sm sm:p-5" aria-labelledby="next-step-heading">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600"><Sparkles size={15} aria-hidden="true" /> One useful next step</p>
            <h2 id="next-step-heading" className="mt-2 text-lg font-bold text-midnight">{nextAction.label}</h2>
            <details className="mt-2 text-sm text-slate-600">
              <summary className="min-h-8 cursor-pointer font-medium text-midnight underline underline-offset-2">Why this step?</summary>
              <p className="mt-2 leading-6">{homeFocus === 'all' && forge.preferences.personalisation_paused ? 'Personal suggestions are paused. This general starting point is not based on your profile or activity.' : nextAction.reason}</p>
            </details>
            <Link href={nextAction.href} className="btn-primary mt-4 min-h-11 w-full sm:w-auto">Continue <ArrowRight size={16} aria-hidden="true" /></Link>
          </aside>
        </div>
      </section>

      <section className="mb-6" aria-labelledby="dashboard-progress-heading">
        <div className="mb-3">
          <p className="eyebrow">Your progress</p>
          <h2 id="dashboard-progress-heading" className="mt-1 text-lg font-bold text-midnight">A quick look at where you are</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/app/profile" className="group rounded-xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-slate-400">
            <span className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-600">Profile basics</span>
              <span className="text-lg font-bold text-midnight">{profileProgress}%</span>
            </span>
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
              <span className="block h-full rounded-full bg-slate-700 transition-[width]" style={{ width: `${profileProgress}%` }} />
            </span>
            <span className="mt-2 flex items-center justify-between text-xs text-slate-500">
              {profileSections.filter(Boolean).length} of {profileSections.length} useful details
              <ArrowRight size={14} className="text-slate-500 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
          <Link href="/app/employment/applications" className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-slate-400">
            <span>
              <span className="block text-sm font-medium text-slate-600">Saved to revisit</span>
              <span className="mt-1 block text-2xl font-bold text-midnight">{savedCount}</span>
            </span>
            <span className="text-right text-xs text-slate-500">Your saved<br />opportunities <ArrowRight size={14} className="ml-auto mt-1 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
          </Link>
          <Link href="/app/employment/applications" className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-slate-400">
            <span>
              <span className="block text-sm font-medium text-slate-600">Marked as applied</span>
              <span className="mt-1 block text-2xl font-bold text-midnight">{appliedCount}</span>
            </span>
            <span className="text-right text-xs text-slate-500">Track your<br />application progress <ArrowRight size={14} className="ml-auto mt-1 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
          </Link>
        </div>
        {nextDeadline && (
          <Link href="/app/employment/applications" className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm transition hover:border-amber-400">
            <CalendarDays size={18} className="shrink-0 text-amber-800" aria-hidden="true" />
            <span className="min-w-0 flex-1"><strong className="text-amber-950">{nextDeadline.label} · {formatDate(nextDeadline.date)}</strong><span className="block truncate text-amber-900">{nextDeadline.title}</span></span>
            <span className="inline-flex items-center gap-1 font-semibold text-amber-950">Review <ArrowRight size={15} aria-hidden="true" /></span>
          </Link>
        )}
      </section>

      <section className="mb-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <p className="eyebrow">A useful tip · {focusOption.label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{tip.text}</p>
        </article>
        <article className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <div>
            <p className="eyebrow">Explore beyond {focusOption.label === 'Everything' ? 'your current focus' : focusOption.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">There’s more than one way to move forward.</p>
          </div>
          <Link href={tip.otherHref} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-midnight transition hover:border-slate-500 hover:bg-slate-50">{tip.otherLabel} <ArrowRight size={15} aria-hidden="true" /></Link>
        </article>
      </section>

      <div className="mb-6 grid items-start gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <details className="rounded-2xl border border-slate-200 bg-white shadow-card">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block font-semibold text-midnight">Your starter plan</span>
              <span className="mt-1 block text-xs text-slate-500">{progressCount} actions complete</span>
            </span>
            <span className="text-sm font-semibold text-midnight">View checklist</span>
          </summary>
          <ul className="divide-y divide-slate-200 border-t border-slate-200 px-5">
            {starterActions.map((action) => (
              <li key={action.id} className="flex items-center gap-3 py-3">
                <input
                  id={`starter-action-${action.id}`}
                  type="checkbox"
                  checked={completed.includes(action.id)}
                  disabled={saving}
                  onChange={() => void toggleAction(action.id)}
                  aria-label={`Mark ${action.label} ${completed.includes(action.id) ? 'incomplete' : 'complete'}`}
                  className="h-5 w-5 shrink-0 accent-sunshine-dark"
                />
                <Link href={action.href} className={`min-w-0 flex-1 text-sm font-medium underline-offset-2 hover:underline ${completed.includes(action.id) ? 'text-slate-500 line-through' : 'text-midnight'}`}>
                  {action.label}<span className="mt-1 block text-xs font-normal text-slate-500">{action.area}</span>
                </Link>
                <Link href={action.href} aria-label={`Open ${action.area}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-midnight"><ArrowRight size={17} aria-hidden="true" /></Link>
              </li>
            ))}
          </ul>
        </details>
        <PublishedSiteContent contentType="announcement" heading="Updates from Ukukhanya" eyebrow="From Ukukhanya" className="!my-0" display="list" />
      </div>

      {storageWarning && <p role="alert" className="mb-4 text-sm text-amber-800">{storageWarning}</p>}
      <p className="border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">Your checklist is private to your account. Dates and application details should always be confirmed with the official provider.</p>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublishedSiteContent } from '@/components/PublishedSiteContent';
import { useForge } from '@/components/ForgeContext';
import { getSupabase } from '@/lib/supabase';
import { ArrowRight, Banknote, BriefcaseBusiness, Compass, GraduationCap, Lightbulb, Sparkles } from 'lucide-react';

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
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 md:py-9 lg:px-8">
      <header className="mb-6">
        <p className="eyebrow">Your home</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-midnight sm:text-4xl">{greeting}, {forge.firstName || 'there'}.</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Pick up where you left off. Your reminder and next step are here.</p>
      </header>

      {forge.recentWin && <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status"><strong>Nice progress.</strong> {forge.recentWin}</p>}

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="next-step-heading">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><Sparkles size={15} aria-hidden="true" /> Your next step <span aria-hidden="true">·</span> <FocusIcon size={14} aria-hidden="true" /> {focusOption.label} focus</p>
            <h2 id="next-step-heading" className="mt-2 text-xl font-bold text-midnight">{nextAction.label}</h2>
            <details className="mt-2 text-sm text-slate-600">
              <summary className="min-h-8 cursor-pointer font-medium text-midnight underline underline-offset-2">Why this step?</summary>
              <p className="mt-2 leading-6">{homeFocus === 'all' && forge.preferences.personalisation_paused ? 'Personal suggestions are paused. This general starting point is not based on your profile or activity.' : nextAction.reason}</p>
            </details>
          </div>
          <Link href={nextAction.href} className="btn-primary min-h-11 w-full sm:w-auto">Continue <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
          <label htmlFor="home-focus" className="text-sm font-semibold text-slate-700">Tailor Home to:</label>
          <select id="home-focus" className="input min-h-10 w-full sm:w-auto sm:min-w-44" value={homeFocus} onChange={(event) => changeFocus(event.target.value as HomeFocus)}>
            {focusOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
          <span className="text-xs text-slate-500">Your choice is remembered on this device.</span>
        </div>
      </section>

      <section className="mb-5 grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">A useful tip for {focusOption.label === 'Everything' ? 'your journey' : focusOption.label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{tip.text}</p>
        </article>
        <article className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Explore another path</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">Your current focus is one part of the journey. Take a look at something different whenever you’re ready.</p>
          </div>
          <Link href={tip.otherHref} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-midnight underline underline-offset-4 hover:text-slate-600">{tip.otherLabel} <ArrowRight size={15} aria-hidden="true" /></Link>
        </article>
      </section>

      <details className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-card">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
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

      <PublishedSiteContent contentType="announcement" heading="Updates from Ukukhanya" className="!my-0" display="list" />

      {storageWarning && <p role="alert" className="mt-4 text-sm text-amber-800">{storageWarning}</p>}
      <p className="mt-5 text-xs leading-5 text-slate-500">Your checklist is private to your account. Dates and application details should always be confirmed with the official provider.</p>
    </div>
  );
}

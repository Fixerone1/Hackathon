'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OpportunityFeed } from '@/components/OpportunityFeed';
import { getSupabase } from '@/lib/supabase';

type CurrentUser = { id: string; name: string; email: string };

const starterActions = [
  { id: 'profile', label: 'Add your skills and experience' },
  { id: 'budget', label: 'Set a monthly savings goal' },
  { id: 'idea', label: 'Write down one business idea to test' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [completed, setCompleted] = useState<string[]>([]);
  const [storageWarning, setStorageWarning] = useState('');
  const [authUnavailable, setAuthUnavailable] = useState(false);
  const progress = Math.round((completed.length / starterActions.length) * 100);

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
          setUser({
            id: authData.user.id,
            name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'Learner',
            email: authData.user.email || '',
          });
        }
        const { data, error } = await supabase.from('learner_progress').select('checklist').maybeSingle();
        if (error) {
          if (active) setStorageWarning('Your progress could not be loaded. Check that the Supabase migrations are applied.');
        } else if (active) {
          const checklist = Array.isArray(data?.checklist) ? data.checklist as string[] : [];
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

  async function signOut() {
    try {
      await getSupabase().auth.signOut({ scope: 'local' });
    } finally {
      router.replace('/login');
    }
  }

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
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-[#e7e5dc] bg-surface px-5 py-6 shadow-card sm:px-7">
        <div>
          <p className="eyebrow">Learner workspace</p>
          <h1 className="page-title mt-1">Welcome, {user.name}</h1>
          <p className="page-description mt-2">Choose a practical next step and keep your progress moving.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/profile" className="btn-secondary min-h-10">Edit profile</Link>
          <button type="button" onClick={signOut} className="btn-secondary min-h-10">Sign out</button>
        </div>
      </header>

      <section className="mb-8" aria-labelledby="matches-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="eyebrow">Opportunity connector</p>
            <h2 id="matches-heading" className="mt-1 text-2xl font-semibold text-midnight">Your matches today</h2>
          </div>
          <Link href="/app/employment/opportunities" className="link text-sm">Open opportunities</Link>
        </div>
        <div className="mt-5">
          <OpportunityFeed />
        </div>
      </section>

      <div className="grid gap-10 py-8 md:grid-cols-[minmax(0,1fr)_17rem] md:py-10">
        <section className="rounded-2xl border border-[#e7e5dc] bg-surface p-5 shadow-card sm:p-6" aria-labelledby="actions-heading">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 id="actions-heading" className="text-xl font-semibold text-midnight">Your starter plan</h2>
              <p className="mt-1 text-sm text-slate-600">Three small actions across your development goals.</p>
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

        <aside className="space-y-7 rounded-2xl border border-[#e7e5dc] bg-surface p-5 shadow-card sm:p-6">
          <section aria-labelledby="mobility-score-heading">
            <p className="eyebrow">Economic Mobility Score</p>
            <h2 id="mobility-score-heading" className="mt-2 text-2xl font-semibold text-midnight">Not calculated</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">The score needs the employment, money, and growth tools, which are not included in this source upload.</p>
          </section>
          <section aria-labelledby="progress-heading">
            <p className="eyebrow">Starter plan progress</p>
            <h2 id="progress-heading" className="mt-2 text-3xl font-semibold text-midnight">{progress}%</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Completion of the three checklist actions shown here.</p>
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
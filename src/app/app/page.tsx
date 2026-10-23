'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type CurrentUser = { name: string; email: string };

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
    fetch('/auth-api/me', { cache: 'no-store', credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) router.replace('/login');
          else setAuthUnavailable(true);
          return null;
        }
        const result = await response.json() as { user: CurrentUser };
        if (active) setUser(result.user);
        const checklistResponse = await fetch('/auth-api/checklist', { cache: 'no-store', credentials: 'same-origin' });
        if (checklistResponse.ok) {
          const checklist = await checklistResponse.json() as { items: string[] };
          if (active) setCompleted(checklist.items.filter((id) => starterActions.some((action) => action.id === id)));
        } else if (active) {
          setStorageWarning('Your progress could not be loaded. Check the Supabase data setup.');
        }
        return result;
      })
      .then((result) => {
        if (active && result) setUser(result.user);
      })
      .catch(() => router.replace('/login'))
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    return () => { active = false; };
  }, [router]);

  async function signOut() {
    try {
      await fetch('/auth-api/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      router.replace('/login');
    }
  }

  function toggleAction(id: string) {
    const updated = completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id];
    setCompleted(updated);
    fetch('/auth-api/checklist', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ items: updated }),
    }).then((response) => {
      if (!response.ok) setStorageWarning('Your change could not be saved. Check the Supabase data setup.');
      else setStorageWarning('');
    }).catch(() => setStorageWarning('Your change could not be saved. Please try again.'));
  }

  if (authUnavailable) {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600" role="alert">Authentication is unavailable. Check the Supabase configuration and try again.</div>;
  }
  if (checkingSession || !user) {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600" role="status">Checking your session...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="eyebrow">Learner workspace</p>
          <h1 className="mt-1 text-3xl font-semibold text-midnight">Welcome, {user.name}</h1>
          <p className="mt-2 text-sm text-slate-600">Choose a practical next step and keep your progress moving.</p>
        </div>
        <button type="button" onClick={signOut} className="btn-secondary min-h-10">Sign out</button>
      </header>

      <div className="grid gap-10 py-8 md:grid-cols-[minmax(0,1fr)_17rem] md:py-10">
        <section aria-labelledby="actions-heading">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 id="actions-heading" className="text-xl font-semibold text-midnight">Your starter plan</h2>
              <p className="mt-1 text-sm text-slate-600">Three small actions across your development goals.</p>
            </div>
            <span className="text-sm font-semibold text-emerald-dark">{completed.length} of {starterActions.length} complete</span>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Starter plan progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="h-full bg-emerald transition-[width]" style={{ width: `${progress}%` }} />
          </div>
          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {starterActions.map((action, index) => (
              <li key={action.id} className="py-4">
                <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={completed.includes(action.id)}
                    onChange={() => toggleAction(action.id)}
                    className="mt-0.5 h-5 w-5 accent-emerald"
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

        <aside className="space-y-7 border-t border-slate-200 pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0">
          <section aria-labelledby="progress-heading">
            <p className="eyebrow">Overall progress</p>
            <h2 id="progress-heading" className="mt-2 text-4xl font-semibold text-midnight">{progress}%</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Based on completed starter actions. This is not a validated outcome score.</p>
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
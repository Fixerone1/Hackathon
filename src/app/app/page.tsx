'use client';

import Link from 'next/link';
import { useState } from 'react';

const starterActions = [
  { id: 'profile', label: 'Add your skills and experience' },
  { id: 'budget', label: 'Set a monthly savings goal' },
  { id: 'idea', label: 'Write down one business idea to test' },
];

export default function DashboardPage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const progress = Math.round((completed.length / starterActions.length) * 100);

  function toggleAction(id: string) {
    setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm font-semibold text-emerald-dark">Your workspace</p>
            <h1 className="mt-1 text-3xl font-bold text-midnight">Your next steps</h1>
            <p className="mt-2 text-slate-600">A simple place to start building momentum.</p>
          </div>
          <Link href="/signup" className="btn-secondary">Create an account</Link>
        </header>

        <div className="grid gap-8 py-8 md:grid-cols-[minmax(0,1fr)_18rem]">
          <section aria-labelledby="actions-heading">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 id="actions-heading" className="text-xl font-bold text-midnight">Starter checklist</h2>
              <span className="text-sm font-semibold text-emerald-dark">{progress}% complete</span>
            </div>
            <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Checklist progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
              <div className="h-full bg-emerald transition-[width]" style={{ width: `${progress}%` }} />
            </div>
            <ul className="divide-y divide-slate-200 border-y border-slate-200">
              {starterActions.map((action) => (
                <li key={action.id} className="py-4">
                  <label className="flex cursor-pointer items-start gap-3 text-slate-700">
                    <input
                      type="checkbox"
                      checked={completed.includes(action.id)}
                      onChange={() => toggleAction(action.id)}
                      className="mt-0.5 h-5 w-5 accent-emerald"
                    />
                    <span className={completed.includes(action.id) ? 'text-slate-500 line-through' : ''}>{action.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <aside className="space-y-6">
            <section className="border-l-4 border-emerald bg-canvas p-5" aria-labelledby="score-heading">
              <p className="text-sm font-semibold text-slate-500">Economic Mobility Score</p>
              <h2 id="score-heading" className="mt-2 text-4xl font-bold text-midnight">{progress}</h2>
              <p className="mt-1 text-sm text-slate-600">Demo checklist progress</p>
            </section>
            <section id="money-skills" className="border-t border-slate-200 pt-4">
              <h2 className="font-semibold text-midnight">Money skills</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Set a savings target and build confidence with everyday money decisions.</p>
            </section>
            <section id="growth-studio" className="border-t border-slate-200 pt-4">
              <h2 className="font-semibold text-midnight">Growth studio</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Capture an idea and decide on one small experiment to test it.</p>
            </section>
          </aside>
        </div>
        <p className="border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
          This is a demo workspace. Checklist progress is held in memory and resets when you reload the page. No account details are stored.
        </p>
    </div>
  );
}
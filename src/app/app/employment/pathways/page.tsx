'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EmploymentNav } from '@/components/EmploymentNav';

const pathwayOptions = [
  { id: 'work', label: 'Find work', description: 'I want to apply for entry-level roles.' },
  { id: 'learnership', label: 'Learn through work', description: 'I want a learnership or work-based programme.' },
  { id: 'study', label: 'Continue studying', description: 'I want to check whether further study is needed.' },
  { id: 'explore', label: 'I am still exploring', description: 'Help me compare possible routes.' },
] as const;

type PathwayType = (typeof pathwayOptions)[number]['id'];

export default function PathwaysPage() {
  const [goal, setGoal] = useState('');
  const [currentEvidence, setCurrentEvidence] = useState('');
  const [pathway, setPathway] = useState<PathwayType>('explore');
  const [checkedActions, setCheckedActions] = useState<number[]>([]);
  const destination = goal.trim() || 'your target role or study goal';

  const pathwayStep = {
    work: {
      title: 'Compare current job listings',
      detail: `Look for 2 or 3 verified listings related to ${destination}. Note only the requirements the employer actually states, then compare them with your experience and skills. A requirement you have not checked is not automatically a gap.`,
    },
    learnership: {
      title: 'Check each programme before applying',
      detail: `Search verified listings for programmes related to ${destination}. Confirm the employer, eligibility, dates, and application instructions on the original listing or employer site before sharing personal information.`,
    },
    study: {
      title: 'Verify whether study is actually required',
      detail: `Check current listings and official role guidance for ${destination}. If a specific qualification is named, confirm the qualification and provider's registration before enrolling. Do not pay a provider based on this planner.`,
    },
    explore: {
      title: 'Explore real options before choosing a route',
      detail: `Browse current verified listings related to ${destination}, if available. Compare entry-level jobs, learnerships, and study routes using stated requirements, costs, location, and deadlines.`,
    },
  }[pathway];

  const actions = [
    {
      title: 'Name the destination',
      detail: goal.trim()
        ? `Your current target is ${destination}. Make it specific enough to search, such as a role title, field, or course of study.`
        : 'Enter a role, field, or study goal above. If you are unsure, start with a type of work or problem you want to explore.',
    },
    {
      title: pathwayStep.title,
      detail: pathwayStep.detail,
      link: true,
    },
    {
      title: 'List evidence you already have',
      detail: currentEvidence.trim()
        ? `You noted: “${currentEvidence.trim()}” Compare this evidence with each stated requirement. Ask a teacher, mentor, or careers adviser to help interpret anything unclear.`
        : 'Write down relevant subjects, projects, responsibilities, volunteering, work experience, and skills. Do not leave out informal experience.',
    },
    {
      title: 'Choose one verified next move',
      detail: 'Use the original listing or an official institution source to confirm the next step. Check eligibility, provider or employer details, costs, location, and deadlines before committing.',
    },
  ];

  function toggleAction(index: number) {
    setCheckedActions((current) => current.includes(index)
      ? current.filter((item) => item !== index)
      : [...current, index]);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <p className="eyebrow">Employment Hub</p>
      <h1 className="mt-1 text-3xl font-semibold text-midnight">Skills and career path</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Turn a goal into a research-backed next step. This planner helps you check real requirements; it does not assume you have a qualification gap.
      </p>
      <EmploymentNav />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.3fr]">
        <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-xl font-bold text-black">Start with your goal</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">A role, sector, or study direction is enough to begin. You can change it at any time.</p>

          <label htmlFor="pathway-goal" className="mt-5 block text-sm font-semibold text-slate-800">What are you working toward?</label>
          <input
            id="pathway-goal"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            maxLength={120}
            placeholder="e.g. entry-level electrician"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-slate-800 outline-none focus:border-yellow-600 focus:ring-2 focus:ring-yellow-200"
          />

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-slate-800">Which route are you considering?</legend>
            <div className="mt-3 space-y-2">
              {pathwayOptions.map((option) => (
                <label key={option.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${pathway === option.id ? 'border-yellow-500 bg-yellow-50' : 'border-slate-200 bg-white hover:border-slate-400'}`}>
                  <input
                    type="radio"
                    name="pathway-type"
                    value={option.id}
                    checked={pathway === option.id}
                    onChange={() => setPathway(option.id)}
                    className="mt-1 h-4 w-4 accent-yellow-500"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-600">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label htmlFor="current-evidence" className="mt-5 block text-sm font-semibold text-slate-800">What experience or skills do you already have? <span className="font-normal text-slate-500">(optional)</span></label>
          <textarea
            id="current-evidence"
            value={currentEvidence}
            onChange={(event) => setCurrentEvidence(event.target.value)}
            maxLength={600}
            rows={4}
            placeholder="Subjects, projects, responsibilities, volunteering, work experience, or skills"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm leading-6 text-slate-800 outline-none focus:border-yellow-600 focus:ring-2 focus:ring-yellow-200"
          />
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border border-yellow-300 bg-yellow-50 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Your pathway draft</p>
                <h2 className="mt-1 text-xl font-bold text-black">{destination}</h2>
              </div>
              <span className="rounded-full border border-yellow-500 bg-white px-3 py-1 text-xs font-semibold text-slate-800">{checkedActions.length}/{actions.length} actions checked</span>
            </div>

            <ol className="mt-5 space-y-3">
              {actions.map((action, index) => (
                <li key={action.title} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={checkedActions.includes(index)}
                      onChange={() => toggleAction(index)}
                      aria-label={`Mark ${action.title} complete`}
                      className="mt-1 h-4 w-4 accent-yellow-500"
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{index + 1}. {action.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{action.detail}</p>
                      {action.link && (
                        <Link href="/app/employment/opportunities" className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                          Browse verified opportunities
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-black">Verify before you commit</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              When a listing names a qualification or training provider, check the exact requirement with the employer or institution. For South African qualifications and occupational programmes, consult the official <a href="https://www.saqa.org.za/" target="_blank" rel="noreferrer" className="font-semibold text-slate-900 underline">SAQA</a> and <a href="https://www.qcto.org.za/" target="_blank" rel="noreferrer" className="font-semibold text-slate-900 underline">QCTO</a> sources. Confirm the provider and programme directly before paying or enrolling.
            </p>
            <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-500">
              This planner does not verify courses or award credentials. Recommendations are limited to checking current requirements and using verified listings when available.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
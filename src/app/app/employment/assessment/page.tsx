"use client";

import { useMemo, useState } from 'react';
import { EmploymentNav } from '@/components/EmploymentNav';

const skillGroups = {
  problemSolving: 'Problem solving',
  communication: 'Communication',
  planning: 'Planning',
  teamwork: 'Teamwork',
  digital: 'Digital confidence',
  initiative: 'Initiative',
} as const;

const questions = [
  {
    id: 'problemSolving',
    prompt: 'I can break a difficult task into smaller steps and work through it without getting stuck.',
    skill: 'Problem solving',
  },
  {
    id: 'communication',
    prompt: 'I can explain my ideas clearly to someone else and ask for help when I need it.',
    skill: 'Communication',
  },
  {
    id: 'planning',
    prompt: 'I can organise my time and keep track of what needs to happen next.',
    skill: 'Planning',
  },
  {
    id: 'teamwork',
    prompt: 'I work well with other people, listen to feedback, and support the group.',
    skill: 'Teamwork',
  },
  {
    id: 'digital',
    prompt: 'I feel confident using digital tools, online research, and basic productivity apps.',
    skill: 'Digital confidence',
  },
  {
    id: 'initiative',
    prompt: 'I can take the first step on a task, even when I am not told exactly what to do.',
    skill: 'Initiative',
  },
] as const;

const ratingLabels = ['Not yet', 'A little', 'Sometimes', 'Mostly', 'Very confident'] as const;

export default function AssessmentPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const results = useMemo(() => {
    const totals: Record<string, number> = {
      problemSolving: 0,
      communication: 0,
      planning: 0,
      teamwork: 0,
      digital: 0,
      initiative: 0,
    };

    let answered = 0;

    for (const question of questions) {
      const value = answers[question.id];
      if (typeof value === 'number') {
        totals[question.id] += value;
        answered += 1;
      }
    }

    const skillScores = Object.entries(skillGroups).map(([key, label]) => {
      const score = typeof answers[key] === 'number' ? answers[key] : 0;
      return {
        key,
        label,
        score,
        percent: Math.min(100, Math.max(0, (score / 5) * 100)),
      };
    });

    const ranked = [...skillScores].sort((a, b) => b.score - a.score);
    const strongest = ranked[0];
    const nextFocus = ranked[ranked.length - 1];

    return { skillScores, ranked, strongest, nextFocus, answered };
  }, [answers]);

  const complete = results.answered === questions.length;

  const updateAnswer = (id: string, value: number) => {
    setAnswers((current) => ({ ...current, [id]: value }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <p className="eyebrow">Employment Hub</p>
      <h1 className="mt-1 text-3xl font-semibold text-midnight">Skills assessment</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        This quick check helps you understand the strengths you are already using and the areas where you could grow next.
      </p>
      <EmploymentNav />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-black">Rate each statement</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {results.answered}/{questions.length} answered
            </span>
          </div>

          <div className="mt-5 space-y-5">
            {questions.map((question) => (
              <div key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">{question.prompt}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ratingLabels.map((label, index) => {
                    const value = index + 1;
                    const selected = answers[question.id] === value;

                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => updateAnswer(question.id, value)}
                        className={[
                          'rounded-full border px-3 py-2 text-xs font-medium transition',
                          selected
                            ? 'border-yellow-500 bg-yellow-100 text-yellow-900 shadow-sm'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400',
                        ].join(' ')}
                        aria-label={`${question.prompt} - ${label}`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {answers[question.id] ? `${ratingLabels[answers[question.id] - 1]}` : 'Choose a rating'}
                </p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-xl font-bold text-black">Skills being assessed</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {Object.values(skillGroups).map((skill) => (
                <li key={skill} className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  {skill}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-yellow-300 bg-yellow-50 p-5">
            <h2 className="text-xl font-bold text-black">Your skills snapshot</h2>
            {!complete ? (
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Answer all six questions to unlock a clear profile of your strongest skills and your next growth area.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Strongest skill</p>
                  <p className="mt-1 text-lg font-bold text-black">{results.strongest?.label}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Growth area</p>
                  <p className="mt-1 text-lg font-bold text-black">{results.nextFocus?.label}</p>
                </div>

                <div className="space-y-3">
                  {results.skillScores.map(({ key, label, percent }) => (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-700">
                        <span>{label}</span>
                        <span>{Math.round(percent)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
                  Based on your answers, you are strongest in <span className="font-semibold text-black">{results.strongest?.label}</span> and would benefit most from building <span className="font-semibold text-black">{results.nextFocus?.label}</span>.
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

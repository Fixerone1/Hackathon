'use client';

import { useState } from 'react';
import { EmploymentNav } from '@/components/EmploymentNav';

const practiceQuestions = [
  {
    category: 'Experience',
    prompt: 'Tell me about a time you solved a difficult problem.',
  },
  {
    category: 'Teamwork',
    prompt: 'Tell me about a time you worked with others to reach a goal.',
  },
  {
    category: 'Resilience',
    prompt: 'Describe a time something did not go to plan. What did you do?',
  },
  {
    category: 'Motivation',
    prompt: 'Why are you interested in this role or opportunity?',
  },
  {
    category: 'Strengths',
    prompt: 'What is a strength you would bring to this role? Give an example.',
  },
  {
    category: 'Learning',
    prompt: 'Tell me about a time you received feedback and used it to improve.',
  },
];

export default function InterviewPage() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [targetRole, setTargetRole] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const question = practiceQuestions[questionIndex];

  async function requestFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!answer.trim()) {
      setError('Write a practice answer before requesting feedback.');
      return;
    }

    setBusy(true);
    setError('');
    setFeedback('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'interview-feedback',
          payload: {
            question: question.prompt,
            targetRole: targetRole.trim().slice(0, 120),
            answer: answer.trim().slice(0, 3500),
          },
        }),
      });
      const result = await response.json() as { text?: string; error?: string };
      if (!response.ok || !result.text) {
        throw new Error(result.error || 'Interview feedback is unavailable right now.');
      }
      setFeedback(result.text);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Interview feedback is unavailable right now.');
    } finally {
      setBusy(false);
    }
  }

  function chooseQuestion(index: number) {
    setQuestionIndex(index);
    setAnswer('');
    setFeedback('');
    setError('');
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <p className="eyebrow">Employment Hub</p>
      <h1 className="mt-1 text-3xl font-semibold text-midnight">Interview coach</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Practise an answer, then get specific feedback to help you tell a clear story and show what you can do.
      </p>
      <EmploymentNav />

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Practice question {questionIndex + 1} of {practiceQuestions.length}</p>
              <span className="mt-2 inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-900">{question.category}</span>
            </div>
            <label className="text-sm font-medium text-slate-700">
              Target role <span className="text-slate-500">(optional)</span>
              <input
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                maxLength={120}
                placeholder="e.g. Retail assistant"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-yellow-600 focus:ring-2 focus:ring-yellow-200 sm:w-56"
              />
            </label>
          </div>

          <h2 className="mt-5 text-xl font-bold leading-8 text-black">{question.prompt}</h2>

          <form onSubmit={requestFeedback} className="mt-5">
            <label htmlFor="practice-answer" className="mb-2 block text-sm font-semibold text-slate-800">Your answer</label>
            <textarea
              id="practice-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              maxLength={3500}
              rows={9}
              placeholder="Use a real example from work, school, volunteering, sport, or home. Include what happened, what you did, and how it turned out."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-800 outline-none focus:border-yellow-600 focus:ring-2 focus:ring-yellow-200"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">{answer.length}/3500 characters</p>
              <button
                type="submit"
                disabled={busy || !answer.trim()}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {busy ? 'Reviewing answer…' : 'Get feedback'}
              </button>
            </div>
          </form>

          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">{error}</p>
          )}

          {feedback && (
            <section aria-live="polite" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="font-bold text-slate-900">Coach feedback</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800">{feedback}</p>
            </section>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-lg font-bold text-black">Build a STAR answer</h2>
            <dl className="mt-4 space-y-3 text-sm leading-6">
              <div><dt className="font-semibold text-slate-900">Situation</dt><dd className="text-slate-600">Set the scene. What was happening?</dd></div>
              <div><dt className="font-semibold text-slate-900">Task</dt><dd className="text-slate-600">What needed to be done?</dd></div>
              <div><dt className="font-semibold text-slate-900">Action</dt><dd className="text-slate-600">What specific steps did you take?</dd></div>
              <div><dt className="font-semibold text-slate-900">Result</dt><dd className="text-slate-600">What changed or what did you learn?</dd></div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-bold text-black">Choose a question</h2>
            <div className="mt-3 space-y-2">
              {practiceQuestions.map((item, index) => (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => chooseQuestion(index)}
                  aria-pressed={index === questionIndex}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition ${index === questionIndex ? 'border-yellow-500 bg-yellow-100 font-semibold text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'}`}
                >
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{item.category}</span>
                  <span className="mt-1 block leading-5">{item.prompt}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

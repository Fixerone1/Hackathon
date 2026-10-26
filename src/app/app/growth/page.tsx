'use client';

import { useMemo, useState } from 'react';
import { PageIntro } from '@/components/PageIntro';
import { PublishedSiteContent } from '@/components/PublishedSiteContent';

const validationQuestions = [
  'Does the problem affect enough people?',
  'Can I clearly describe my target customer?',
  'Are similar solutions already available?',
  'Why would someone choose my solution?',
  'Can this eventually generate income or attract support?',
];

const defaultAnswers = {
  idea: '',
  problem: '',
  audience: '',
  unique: '',
  stage: 'I only have an idea',
};

export default function GrowthStudioPage() {
  const [answers, setAnswers] = useState(defaultAnswers);

  const ideaSummary = useMemo(() => {
    const idea = answers.idea.trim() || 'your idea';
    const problem = answers.problem.trim() || 'a real problem in your community';
    const audience = answers.audience.trim() || 'your target group';
    const unique = answers.unique.trim() || 'a practical and affordable solution';
    return `${idea} helps ${audience} by solving ${problem} in a way that is ${unique}.`;
  }, [answers]);

  const nextBestStep = useMemo(() => {
    const idea = answers.idea.trim();
    const audience = answers.audience.trim();
    const problem = answers.problem.trim();

    if (!idea && !audience && !problem) {
      return 'Start with one clear idea and one real problem you want to solve.';
    }

    const interviewPrompt = audience
      ? `Talk to 5 ${audience.toLowerCase()} and ask whether ${problem || 'this problem'} is real for them.`
      : 'Talk to 5 people in your target group and ask whether this problem is real for them.';

    const basedOnStage = answers.stage === 'I already have customers or users'
      ? 'Collect feedback from your current users and improve the biggest pain point first.'
      : answers.stage === 'I am ready to launch'
        ? 'Create a simple budget, test a small offer, and get your first paying customer or supporter.'
        : 'Write a one-page concept summary and validate the idea before spending money on it.';

    return `${interviewPrompt} ${basedOnStage}`;
  }, [answers]);

  const score = useMemo(() => {
    const checks = [answers.idea, answers.problem, answers.audience, answers.unique].filter((value) => value.trim().length > 0).length;
    return Math.min(100, Math.round((checks / 4) * 100));
  }, [answers]);

  const updateField = (field: keyof typeof defaultAnswers, value: string) => {
    setAnswers((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro
        eyebrow="Growth Studio"
        title="Explore your ideas"
        description="Turn an idea into a practical next step with a simple test, a real audience, and a plan you can act on."
      />

      <main className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <p className="eyebrow">Idea workshop</p>
          <h2 className="mt-2 text-2xl font-bold text-black">Build the idea before you build the business</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Use this quick prompt to shape a stronger idea, understand the real problem, and decide the next step that makes sense.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label htmlFor="idea" className="mb-2 block text-sm font-semibold text-slate-800">What is your idea?</label>
                <textarea
                  id="idea"
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-yellow-600 focus:ring-2 focus:ring-yellow-200"
                  placeholder="I want to create a weekend coding club for high school learners."
                  value={answers.idea}
                  onChange={(event) => updateField('idea', event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="problem" className="mb-2 block text-sm font-semibold text-slate-800">What problem are you solving?</label>
                <textarea
                  id="problem"
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-yellow-600 focus:ring-2 focus:ring-yellow-200"
                  placeholder="Many learners in my community do not have access to affordable coding education."
                  value={answers.problem}
                  onChange={(event) => updateField('problem', event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="audience" className="mb-2 block text-sm font-semibold text-slate-800">Who are you helping?</label>
                <textarea
                  id="audience"
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-yellow-600 focus:ring-2 focus:ring-yellow-200"
                  placeholder="Students between 13 and 18 years old in my township."
                  value={answers.audience}
                  onChange={(event) => updateField('audience', event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="unique" className="mb-2 block text-sm font-semibold text-slate-800">What makes your solution different?</label>
                <textarea
                  id="unique"
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-yellow-600 focus:ring-2 focus:ring-yellow-200"
                  placeholder="Affordable classes and practical projects taught by local mentors."
                  value={answers.unique}
                  onChange={(event) => updateField('unique', event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="stage" className="mb-2 block text-sm font-semibold text-slate-800">Choose your stage</label>
                <select
                  id="stage"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-yellow-600 focus:ring-2 focus:ring-yellow-200"
                  value={answers.stage}
                  onChange={(event) => updateField('stage', event.target.value)}
                >
                  <option>I only have an idea</option>
                  <option>I already have customers or users</option>
                  <option>I am ready to launch</option>
                </select>
              </div>

              <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Your idea in one sentence</p>
                <p className="mt-3 text-sm leading-7 text-slate-800">{ideaSummary}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Idea clarity</p>
                  <span className="text-sm font-semibold text-black">{score}%</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${score}%` }} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Best next step</p>
                <p className="mt-3 text-sm leading-7 text-slate-800">{nextBestStep}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <h3 className="text-xl font-bold text-black">Validation checklist</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {validationQuestions.map((question) => (
              <label key={question} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-yellow-500" />
                <span>{question}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-yellow-300 bg-yellow-50 p-5 shadow-card sm:p-6">
          <h3 className="text-xl font-bold text-black">Action challenge</h3>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7 text-slate-800">
            <li>Identify one problem worth solving.</li>
            <li>Speak to at least 5 people in your target group.</li>
            <li>Write a one-page summary of your idea.</li>
            <li>Test the idea with real people.</li>
            <li>Use their feedback to decide your next step.</li>
          </ol>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            The goal is not to have the perfect idea. The goal is to take the next practical step toward making it real.
          </p>
        </section>
      </main>
      <PublishedSiteContent
        contentType="growth_resource"
        heading="Ideas and growth resources"
        eyebrow="Explore more"
      />
    </div>
  );
}

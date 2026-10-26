'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Award, Bell, BookOpen, BriefcaseBusiness, Lightbulb, Route, Sparkles } from 'lucide-react';

const remindersStorageKey = 'beacon:journey-reminders-v1';
const academyStorageKey = 'beacon:skills-academy-progress-v1';
const academyActivityStorageKey = 'beacon:skills-academy-activity-v1';
const pathwayStorageKey = 'beacon:pathway-draft-v1';
const growthStorageKey = 'beacon:growth-draft-v1';
const academyLessonCount = 4;
const pathwayActionCount = 4;

type Journey = {
  id: 'academy' | 'pathway' | 'growth';
  title: string;
  href: string;
  description: string;
  progress: number;
  progressLabel: string;
  started: boolean;
  Icon: typeof BookOpen;
};

type PathwayDraft = {
  goal?: string;
  currentEvidence?: string;
  checkedActions?: number[];
  pathway?: string;
};

type GrowthDraft = {
  answers?: { idea?: string; problem?: string; audience?: string; unique?: string };
  checkedQuestions?: number[];
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function todayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function readObject(key: string): Record<string, unknown> | null {
  const value = localStorage.getItem(key);
  if (!value) return null;
  const parsed: unknown = JSON.parse(value);
  return isObject(parsed) ? parsed : null;
}

export function JourneyProgress({ profileProgress, appliedCount }: { profileProgress: number; appliedCount: number }) {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [reminders, setReminders] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const academy = localStorage.getItem(academyStorageKey);
      const academyIds: unknown = academy ? JSON.parse(academy) : [];
      const academyCount = Array.isArray(academyIds)
        ? new Set(academyIds.filter((id): id is string => typeof id === 'string')).size
        : 0;
      const academyStarted = academyCount > 0 || Boolean(localStorage.getItem(academyActivityStorageKey));
      const pathway = readObject(pathwayStorageKey) as PathwayDraft | null;
      const pathwayActions = Array.isArray(pathway?.checkedActions)
        ? new Set(pathway.checkedActions.filter((item): item is number => Number.isInteger(item) && item >= 0 && item < pathwayActionCount)).size
        : 0;
      const pathwayStarted = Boolean(pathway?.goal?.trim() || pathway?.currentEvidence?.trim() || pathwayActions
        || (pathway?.pathway && pathway.pathway !== 'explore'));
      const growth = readObject(growthStorageKey) as GrowthDraft | null;
      const growthAnswers = growth?.answers && isObject(growth.answers) ? growth.answers : {};
      const growthFields = ['idea', 'problem', 'audience', 'unique'] as const;
      const growthCount = growthFields.filter((field) =>
        typeof growthAnswers[field] === 'string' && growthAnswers[field].trim().length > 0,
      ).length;
      const growthChecks = Array.isArray(growth?.checkedQuestions)
        ? new Set(growth.checkedQuestions.filter((item): item is number => Number.isInteger(item) && item >= 0 && item < 5)).size
        : 0;
      const growthProgress = growthCount + growthChecks;
      const storedReminders = localStorage.getItem(remindersStorageKey);
      const parsedReminders: unknown = storedReminders ? JSON.parse(storedReminders) : {};
      const validReminders = isObject(parsedReminders)
        ? Object.fromEntries(Object.entries(parsedReminders).filter((entry): entry is [string, string] =>
          typeof entry[1] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry[1]),
        ))
        : {};

      setJourneys([
        {
          id: 'academy',
          title: 'Skills Academy',
          href: '/app/employment/academy',
          description: 'Short lessons and knowledge checks',
          progress: Math.min(academyCount, academyLessonCount),
          progressLabel: academyCount > 0
            ? `${Math.min(academyCount, academyLessonCount)} of ${academyLessonCount} lessons complete`
            : 'Lesson opened · no lessons completed yet',
          started: academyStarted,
          Icon: BookOpen,
        },
        {
          id: 'pathway',
          title: 'Study & career pathway',
          href: '/app/employment/pathways',
          description: 'A plan built around your next step',
          progress: pathwayActions,
          progressLabel: `${pathwayActions} of ${pathwayActionCount} actions checked`,
          started: pathwayStarted,
          Icon: Route,
        },
        {
          id: 'growth',
          title: 'Growth Studio',
          href: '/app/growth',
          description: 'Shape an idea and test it',
          progress: growthProgress,
          progressLabel: `${growthCount} prompts and ${growthChecks} checks done`,
          started: growthProgress > 0,
          Icon: Lightbulb,
        },
      ]);
      setReminders(validReminders);
    } catch (caught) {
      setError(caught instanceof Error ? `Saved journey progress could not be loaded: ${caught.message}` : 'Saved journey progress could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  function updateReminder(journeyId: Journey['id'], date: string) {
    const updated = { ...reminders };
    if (date) updated[journeyId] = date;
    else delete updated[journeyId];
    setError('');
    try {
      localStorage.setItem(remindersStorageKey, JSON.stringify(updated));
      setReminders(updated);
    } catch (caught) {
      setError(caught instanceof Error ? `Your reminder could not be saved: ${caught.message}` : 'Your reminder could not be saved.');
    }
  }

  const milestones = [
    ...(profileProgress >= 50 ? ['You’ve built at least half of your learner profile.'] : []),
    ...(journeys.find((journey) => journey.id === 'academy')?.progress
      ? ['You completed your first Skills Academy lesson.'] : []),
    ...(journeys.find((journey) => journey.id === 'pathway')?.progress
      ? ['You checked off a step in your pathway plan.'] : []),
    ...(journeys.find((journey) => journey.id === 'growth')?.started
      ? ['You took a first step in Growth Studio.'] : []),
    ...(appliedCount > 0 ? ['You marked your first opportunity as applied.'] : []),
  ];
  const activeJourneys = journeys.filter((journey) => journey.started);
  const dueJourneys = activeJourneys.filter((journey) => reminders[journey.id] && reminders[journey.id] <= todayKey());

  return (
    <section className="mb-7 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6" aria-labelledby="journey-progress-heading">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="eyebrow">Your journey</p>
          <h2 id="journey-progress-heading" className="mt-1 text-xl font-bold text-midnight">Pick up where you left off</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Your drafts and practice progress stay on this device. Set a gentle reminder for a day you want to continue.</p>
        </div>
        {milestones.length > 0 && (
          <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 lg:max-w-sm" aria-labelledby="milestone-heading">
            <h3 id="milestone-heading" className="flex items-center gap-2 text-sm font-bold text-amber-950">
              <Award size={18} aria-hidden="true" /> Small wins worth celebrating
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-5 text-amber-950">
              {milestones.map((milestone) => <li key={milestone} className="flex gap-2"><Sparkles size={15} className="mt-0.5 shrink-0" aria-hidden="true" />{milestone}</li>)}
            </ul>
          </aside>
        )}
      </div>
      {milestones.length === 0 && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-950">
          <Award size={17} className="shrink-0" aria-hidden="true" /> Your first small win is just one step away. We’ll celebrate progress as you go.
        </p>
      )}

      {dueJourneys.length > 0 && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-white p-3 text-sm leading-5 text-amber-950" role="status">
          <Bell size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>Ready when you are: {dueJourneys.map(({ title }) => title).join(', ')} {dueJourneys.length === 1 ? 'is' : 'are'} due for a check-in.</span>
        </p>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-slate-600" role="status">Loading saved progress...</p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {activeJourneys.map(({ id, title, href, description, progress, progressLabel, Icon }) => {
            const max = id === 'academy' ? academyLessonCount : id === 'pathway' ? pathwayActionCount : 9;
            const percent = Math.round(progress * 100 / max);
            const due = Boolean(reminders[id] && reminders[id] <= todayKey());
            return (
              <article key={id} className={`rounded-xl border bg-white p-4 shadow-card ${due ? 'border-amber-300' : 'border-slate-200'}`}>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sunshine-light text-midnight"><Icon size={19} aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-midnight">{title}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                  </div>
                  {due && <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-950">Check in</span>}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-slate-600">{progressLabel}</span>
                  <span className="font-bold text-midnight">{percent}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${title} progress`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={progress}>
                  <div className="h-full rounded-full bg-emerald-600 transition-[width]" style={{ width: `${percent}%` }} />
                </div>
                <Link href={href} className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-midnight underline underline-offset-2">
                  Continue <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <label htmlFor={`journey-reminder-${id}`} className="mt-3 block border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
                  Remind me to continue
                  <input
                    id={`journey-reminder-${id}`}
                    type="date"
                    min={todayKey()}
                    value={reminders[id] || ''}
                    onChange={(event) => updateReminder(id, event.target.value)}
                    disabled={loading}
                    className="input mt-1 min-h-10 bg-white text-sm"
                  />
                </label>
              </article>
            );
          })}
        </div>
      )}
      {!loading && activeJourneys.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm leading-6 text-slate-600">
          <p>Every journey starts somewhere. Try a short lesson, sketch a pathway, or add one detail to an idea.</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/app/employment/academy" className="inline-flex min-h-10 items-center gap-1 font-semibold text-midnight underline underline-offset-2"><BookOpen size={15} aria-hidden="true" /> Try a lesson</Link>
            <Link href="/app/employment/pathways" className="inline-flex min-h-10 items-center gap-1 font-semibold text-midnight underline underline-offset-2"><BriefcaseBusiness size={15} aria-hidden="true" /> Start a pathway</Link>
            <Link href="/app/growth" className="inline-flex min-h-10 items-center gap-1 font-semibold text-midnight underline underline-offset-2"><Lightbulb size={15} aria-hidden="true" /> Shape an idea</Link>
          </div>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
      <p className="mt-3 text-xs leading-5 text-slate-500">Reminders are saved in this browser and shown when you return to Home. They do not send push notifications or email.</p>
    </section>
  );
}

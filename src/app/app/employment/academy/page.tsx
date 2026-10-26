'use client';

import { useEffect, useState } from 'react';
import { PageIntro } from '@/components/PageIntro';
import { StudyNav } from '@/components/StudyNav';

const progressStorageKey = 'beacon:skills-academy-progress-v1';

const lessons = [
  {
    id: 'clear-communication',
    category: 'Communication',
    title: 'Write a clear work message',
    summary: 'Share information and requests so the other person knows what to do next.',
    duration: '5 min',
    sections: [
      {
        heading: 'Lead with the reason',
        text: 'Start with the context the person needs. A useful message is brief, respectful, and specific. Avoid sending only “Hi” and waiting for a reply before explaining what you need.',
      },
      {
        heading: 'Make the request actionable',
        text: 'State the task, relevant details, and deadline. For example: “Could you check the stock count for the blue shirts before 14:00 today? Please message me if any sizes are missing.”',
      },
      {
        heading: 'Close the loop',
        text: 'Confirm important instructions in writing and let people know when a task is complete. If a deadline is at risk, raise it early and suggest a realistic next step.',
      },
    ],
    question: 'Which message makes the next action clearest?',
    choices: [
      '“Please send the updated shift list by 16:00 today so I can confirm cover.”',
      '“Can you do that thing soon?”',
      '“Hi.”',
    ],
    answer: 0,
    explanation: 'It names the task, deadline, and reason, so the recipient can act without guessing.',
  },
  {
    id: 'plan-your-work',
    category: 'Planning',
    title: 'Plan tasks and meet deadlines',
    summary: 'Turn a busy day into manageable steps and communicate when plans change.',
    duration: '6 min',
    sections: [
      {
        heading: 'Get the tasks out of your head',
        text: 'Write down what needs doing, when it is due, and who is waiting for it. Break large tasks into small actions that can be started and checked off.',
      },
      {
        heading: 'Choose what comes first',
        text: 'Prioritise tasks with near deadlines, safety implications, or people blocked until you finish. If priorities conflict, ask your supervisor which task should come first instead of silently guessing.',
      },
      {
        heading: 'Leave room to adjust',
        text: 'Check your list during the day. If you may miss a deadline, share the risk early, explain what is complete, and agree on the next plan.',
      },
    ],
    question: 'Two tasks are due today, but one coworker cannot continue until you finish your task. What is a good first step?',
    choices: [
      'Ignore the coworker and work on whichever task looks easiest.',
      'Check the deadlines and impact, then confirm priorities with your supervisor if they conflict.',
      'Wait until the end of the day to mention the conflict.',
    ],
    answer: 1,
    explanation: 'Deadlines and dependencies matter. Make the conflict visible early and confirm priorities when needed.',
  },
  {
    id: 'work-in-a-team',
    category: 'Teamwork',
    title: 'Contribute to a team',
    summary: 'Coordinate responsibilities, listen actively, and handle disagreements constructively.',
    duration: '5 min',
    sections: [
      {
        heading: 'Agree on the goal',
        text: 'Make sure everyone understands the shared outcome, their responsibilities, and when work is due. Ask questions if ownership is unclear.',
      },
      {
        heading: 'Listen before responding',
        text: 'Let a teammate finish, check that you understood their point, and focus feedback on the task rather than the person. Different viewpoints can reveal a better approach.',
      },
      {
        heading: 'Raise issues respectfully',
        text: 'Describe what happened and its impact, then suggest a way forward. If a problem affects safety or cannot be resolved within the team, use the appropriate supervisor or reporting channel.',
      },
    ],
    question: 'A teammate disagrees with your approach. What response best supports teamwork?',
    choices: [
      'Ask what concern they see, compare the options against the team goal, and agree a next step.',
      'Stop sharing information with them.',
      'Insist that your idea is the only one worth trying.',
    ],
    answer: 0,
    explanation: 'Listening and returning to the shared goal helps the team assess ideas without making it personal.',
  },
  {
    id: 'digital-safety',
    category: 'Digital confidence',
    title: 'Use digital tools safely',
    summary: 'Protect accounts and spot common warning signs in messages and links.',
    duration: '6 min',
    sections: [
      {
        heading: 'Protect your accounts',
        text: 'Use a different, hard-to-guess password for each important account and turn on multi-factor authentication where available. Never share your password or one-time verification code.',
      },
      {
        heading: 'Pause before opening links',
        text: 'Unexpected urgency, requests for money or codes, unfamiliar sender addresses, and mismatched web addresses are warning signs. Verify through a separate trusted channel before acting.',
      },
      {
        heading: 'Keep work information private',
        text: 'Use approved tools for work files, lock shared devices when you step away, and avoid entering personal or employer information into unfamiliar websites or apps.',
      },
    ],
    question: 'A message says your account will be closed unless you share the code sent to your phone. What should you do?',
    choices: [
      'Send the code quickly to avoid losing access.',
      'Do not share the code; verify the message through the service’s official app or contact channel.',
      'Forward the message to coworkers and ask them to try the link.',
    ],
    answer: 1,
    explanation: 'One-time codes protect account access. Do not share them; verify unexpected messages independently.',
  },
] as const;

type LessonId = (typeof lessons)[number]['id'];

export default function AcademyPage() {
  const [selectedLessonId, setSelectedLessonId] = useState<LessonId>(lessons[0].id);
  const [completedLessons, setCompletedLessons] = useState<LessonId[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState('');
  const [progressLoaded, setProgressLoaded] = useState(false);
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0];
  const completedCount = completedLessons.length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(progressStorageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validIds = parsed.filter((id): id is LessonId =>
            typeof id === 'string' && lessons.some((lesson) => lesson.id === id),
          );
          setCompletedLessons([...new Set(validIds)]);
        }
      }
    } catch {
      localStorage.removeItem(progressStorageKey);
    } finally {
      setProgressLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (progressLoaded) {
      localStorage.setItem(progressStorageKey, JSON.stringify(completedLessons));
    }
  }, [completedLessons, progressLoaded]);

  function selectLesson(id: LessonId) {
    setSelectedLessonId(id);
    setSelectedAnswer(null);
    setAnswerFeedback('');
  }

  function checkAnswer() {
    if (selectedAnswer === null) return;

    if (selectedAnswer === selectedLesson.answer) {
      setCompletedLessons((current) => [...new Set([...current, selectedLesson.id])]);
      setAnswerFeedback(`That's right. ${selectedLesson.explanation}`);
      return;
    }

    setAnswerFeedback(`Not quite. Review the lesson and try again. ${selectedLesson.explanation}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro eyebrow="Study Hub" title="Skills Academy" description="Build practical skills with short lessons and knowledge checks. Your progress is saved on this device." />
      <StudyNav />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.5fr]">
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold text-black">Your practice progress</h2>
              <span className="text-sm font-semibold text-slate-700">{completedCount}/{lessons.length}</span>
            </div>
            <div
              className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-label="Lessons completed"
              aria-valuemin={0}
              aria-valuemax={lessons.length}
              aria-valuenow={completedCount}
            >
              <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-600">Practice progress only. These activities do not award an accredited qualification or credential.</p>
          </section>

          <nav aria-label="Skills Academy lessons" className="space-y-2">
            {lessons.map((lesson, index) => {
              const active = selectedLessonId === lesson.id;
              const completed = completedLessons.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => selectLesson(lesson.id)}
                  aria-pressed={active}
                  className={`w-full rounded-xl border p-4 text-left transition ${active ? 'border-yellow-500 bg-yellow-50' : 'border-slate-200 bg-white hover:border-slate-400'}`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Lesson {index + 1} · {lesson.category}</span>
                      <span className="mt-1 block text-sm font-semibold leading-5 text-slate-900">{lesson.title}</span>
                      <span className="mt-1 block text-xs text-slate-500">{lesson.duration}</span>
                    </span>
                    {completed && <span className="shrink-0 text-xs font-semibold text-emerald-800">Done</span>}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{selectedLesson.category} · {selectedLesson.duration}</p>
            <h2 className="mt-2 text-2xl font-bold text-black">{selectedLesson.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{selectedLesson.summary}</p>

            <div className="mt-6 space-y-5">
              {selectedLesson.sections.map((section) => (
                <section key={section.heading} className="border-l-2 border-yellow-400 pl-4">
                  <h3 className="font-semibold text-slate-900">{section.heading}</h3>
                  <p className="mt-1 text-sm leading-7 text-slate-700">{section.text}</p>
                </section>
              ))}
            </div>

            <section className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <h3 className="font-bold text-slate-900">Quick knowledge check</h3>
              <p className="mt-2 text-sm leading-6 text-slate-800">{selectedLesson.question}</p>
              <fieldset className="mt-4 space-y-2">
                <legend className="sr-only">Choose one answer</legend>
                {selectedLesson.choices.map((choice, index) => (
                  <label key={choice} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm leading-6 transition ${selectedAnswer === index ? 'border-yellow-500 bg-yellow-50' : 'border-slate-200 bg-white hover:border-slate-400'}`}>
                    <input
                      type="radio"
                      name={`answer-${selectedLesson.id}`}
                      value={index}
                      checked={selectedAnswer === index}
                      onChange={() => {
                        setSelectedAnswer(index);
                        setAnswerFeedback('');
                      }}
                      className="mt-1 h-4 w-4 accent-yellow-500"
                    />
                    <span>{choice}</span>
                  </label>
                ))}
              </fieldset>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={checkAnswer}
                  disabled={selectedAnswer === null}
                  className="min-h-10 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  Check answer
                </button>
                {completedLessons.includes(selectedLesson.id) && <span className="text-sm font-semibold text-emerald-800">Lesson complete</span>}
              </div>
              {answerFeedback && (
                <p role="status" className={`mt-3 rounded-lg p-3 text-sm leading-6 ${selectedAnswer === selectedLesson.answer ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}>
                  {answerFeedback}
                </p>
              )}
            </section>
          </article>
        </main>
      </div>
    </div>
  );
}
'use client';

import { READINESS_CHECKLIST } from '@/lib/data';
import { useStore } from '@/lib/store';
import { LessonList } from '@/components/LessonList';
import { Card, Notice, PageHeader, ProgressBar, ScoreRing } from '@/components/ui';

export default function Readiness() {
  const { state, update } = useStore();
  const groups = Array.from(new Set(READINESS_CHECKLIST.map((c) => c.group)));
  const pct = Math.round((state.checklist.length / READINESS_CHECKLIST.length) * 100);

  function toggle(id: string) {
    update((s) => ({ ...s, checklist: s.checklist.includes(id) ? s.checklist.filter((x) => x !== id) : [...s.checklist, id] }));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Startup readiness" subtitle="Tick what you have done honestly. The gaps show your next steps." />
      <Card className="flex flex-wrap items-center gap-6">
        <ScoreRing value={pct} size={110} sub="Ready" label="Startup readiness" />
        <div className="min-w-[220px] flex-1 space-y-3">
          {groups.map((g) => {
            const items = READINESS_CHECKLIST.filter((c) => c.group === g);
            const done = items.filter((c) => state.checklist.includes(c.id)).length;
            return <ProgressBar key={g} value={(done / items.length) * 100} label={g} />;
          })}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <fieldset key={g} className="card">
            <legend className="px-1 font-semibold text-midnight">{g}</legend>
            <ul className="mt-2 space-y-2">
              {READINESS_CHECKLIST.filter((c) => c.group === g).map((c) => (
                <li key={c.id}>
                  <label className="flex min-h-[44px] cursor-pointer items-start gap-3 text-sm">
                    <input type="checkbox" className="mt-0.5 h-5 w-5 accent-emerald" checked={state.checklist.includes(c.id)} onChange={() => toggle(c.id)} />
                    <span>{c.text}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}
      </div>

      <Notice tone="warn">
        Registration, tax and funding rules change. Confirm current requirements with the official sources: CIPC (company registration), SARS (tax), and youth enterprise funders such as Seda, NYDA and sefa.
      </Notice>

      <section aria-labelledby="growth-lessons">
        <h2 id="growth-lessons" className="mb-3 text-lg font-bold text-midnight">Growth lessons</h2>
        <LessonList track="growth" />
      </section>
    </div>
  );
}

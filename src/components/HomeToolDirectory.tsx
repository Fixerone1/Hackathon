'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Banknote, BriefcaseBusiness, GraduationCap, Lightbulb, Sparkles } from 'lucide-react';
import { employmentToolDirectory } from '@/lib/navigation';

type ToolFocus = 'study' | 'work' | 'business' | 'money';

type Focus = 'all' | 'study' | 'work' | 'business' | 'money';

const focusOptions = [
  { id: 'all', label: 'All tools', Icon: Sparkles },
  { id: 'study', label: 'Study', Icon: GraduationCap },
  { id: 'work', label: 'Work', Icon: BriefcaseBusiness },
  { id: 'business', label: 'Business', Icon: Lightbulb },
  { id: 'money', label: 'Money', Icon: Banknote },
] as const;

export function HomeToolDirectory() {
  const [focus, setFocus] = useState<Focus>('all');
  const orderedTools = useMemo(() => {
    if (focus === 'all') return employmentToolDirectory;
    return employmentToolDirectory.filter((tool) => tool.focus.includes(focus));
  }, [focus]);

  useEffect(() => {
    const stored = localStorage.getItem('careerforge-home-focus');
    if (stored === 'study' || stored === 'work' || stored === 'business' || stored === 'money') setFocus(stored);
  }, []);

  function chooseFocus(nextFocus: Focus) {
    setFocus(nextFocus);
    if (nextFocus === 'all') localStorage.removeItem('careerforge-home-focus');
    else localStorage.setItem('careerforge-home-focus', nextFocus);
  }

  return (
    <div className="mt-7">
      <div role="group" aria-label="Filter tools by goal" className="flex gap-2 overflow-x-auto pb-2">
        {focusOptions.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={focus === id}
            onClick={() => chooseFocus(id)}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors ${focus === id ? 'border-black bg-black text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'}`}
          >
            <Icon size={16} aria-hidden="true" />{label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-live="polite">
        {orderedTools.map(({ Icon, title, text, href, tag }) => (
          <Link key={title} href={href} className="group flex min-h-40 flex-col items-start rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-card focus-visible:ring-2 focus-visible:ring-sunshine-dark sm:p-5">
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-[10px] font-bold tracking-[0.12em] text-midnight">{tag}</span>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sunshine-light text-midnight">
                <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </div>
            <h3 className="mt-3 text-base font-bold text-midnight">{title}</h3>
            <p className="mt-1 flex-1 text-sm leading-5 text-midnight">{text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-midnight group-hover:underline">
              Open <ArrowRight size={14} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

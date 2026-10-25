'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { employmentToolDirectory } from '@/lib/navigation';

type ToolFocus = 'study' | 'work' | 'business' | 'money';

type Focus = 'all' | 'study' | 'work' | 'business' | 'money';

export function HomeToolDirectory() {
  const [focus, setFocus] = useState<Focus>('all');
  const orderedTools = useMemo(() => {
    if (focus === 'all') return employmentToolDirectory;
    return [...employmentToolDirectory].sort((first, second) => Number(second.focus.includes(focus)) - Number(first.focus.includes(focus)));
  }, [focus]);

  useEffect(() => {
    const stored = localStorage.getItem('careerforge-home-focus');
    if (stored === 'study' || stored === 'work' || stored === 'business' || stored === 'money') setFocus(stored);
  }, []);

  return (
    <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {orderedTools.map(({ Icon, title, text, href, tag, focus: categories }) => {
        const isRelevant = focus !== 'all' && categories.includes(focus);
        const featured = isRelevant || (focus === 'all' && (href === '/app/employment/opportunities' || href === '/app/money'));
        return (
          <Link key={title} href={href} className={`group flex min-h-44 flex-col items-start rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card focus-visible:ring-2 focus-visible:ring-sunshine-dark sm:p-5 ${featured ? 'border-sunshine bg-sunshine-light' : 'border-slate-200 bg-white'}`}>
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-[10px] font-bold tracking-[0.12em] text-midnight">{tag}</span>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${featured ? 'bg-white' : 'bg-sunshine'}`}>
                <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </div>
            <h3 className="mt-3 text-base font-bold text-midnight">{title}</h3>
            <p className="mt-1 flex-1 text-sm leading-5 text-midnight">{text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-midnight group-hover:underline">
              Explore tool <ArrowRight size={14} aria-hidden="true" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

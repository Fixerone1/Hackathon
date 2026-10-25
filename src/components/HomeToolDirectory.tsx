'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  Lightbulb,
  MessageCircle,
  Route,
  type LucideIcon,
} from 'lucide-react';

type ToolFocus = 'study' | 'work' | 'business' | 'money';
type HomeTool = { icon: LucideIcon; title: string; text: string; href: string; tag: string; focus: readonly ToolFocus[] };

const tools: readonly HomeTool[] = [
  { icon: ClipboardCheck, title: 'Skills assessment', text: 'A dedicated career assessment is not active in this preview yet.', href: '/app/employment/assessment', tag: 'NOT ACTIVE YET', focus: ['work', 'study'] },
  { icon: FileText, title: 'CV Builder', text: 'The CV builder is not active in this preview yet.', href: '/app/employment/cv', tag: 'NOT ACTIVE YET', focus: ['work'] },
  { icon: MessageCircle, title: 'Interview Coach', text: 'Interview practice is not active in this preview yet.', href: '/app/employment/interview', tag: 'NOT ACTIVE YET', focus: ['work'] },
  { icon: BookOpen, title: 'Skills Academy', text: 'Lessons and course credentials are not available in this preview yet.', href: '/app/employment/academy', tag: 'NOT ACTIVE YET', focus: ['study', 'work'] },
  { icon: BriefcaseBusiness, title: 'Opportunities', text: 'Browse verified listings when they are available and open the original advert.', href: '/app/employment/opportunities', tag: 'LISTINGS MAY VARY', focus: ['work', 'business'] },
  { icon: Route, title: 'Study & career pathways', text: 'Verified courses, learnerships, and university deadlines are not connected yet.', href: '/app/employment/pathways', tag: 'MORE TO COME', focus: ['study'] },
  { icon: Banknote, title: 'Money Skills', text: 'Money lessons and budgeting calculators are not active in this preview yet.', href: '/app/money', tag: 'MORE TO COME', focus: ['money'] },
  { icon: Lightbulb, title: 'Growth Studio', text: 'Business idea tools and verified funding listings are not connected yet.', href: '/app/growth', tag: 'MORE TO COME', focus: ['business'] },
] as const;

type Focus = 'all' | 'study' | 'work' | 'business' | 'money';

export function HomeToolDirectory() {
  const [focus, setFocus] = useState<Focus>('all');
  const orderedTools = useMemo(() => {
    if (focus === 'all') return tools;
    return [...tools].sort((first, second) => Number(second.focus.includes(focus)) - Number(first.focus.includes(focus)));
  }, [focus]);

  useEffect(() => {
    const stored = localStorage.getItem('careerforge-home-focus');
    if (stored === 'study' || stored === 'work' || stored === 'business' || stored === 'money') setFocus(stored);
  }, []);

  return (
    <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {orderedTools.map(({ icon: Icon, title, text, href, tag, focus: categories }, index) => {
        const isRelevant = focus !== 'all' && categories.includes(focus);
        const featured = isRelevant || (focus === 'all' && (index === 1 || index === 6));
        return (
          <Link key={title} href={href} className={`group flex min-h-48 flex-col items-center rounded-3xl border p-4 text-center transition hover:-translate-y-1 hover:border-sunshine-dark hover:shadow-[0_10px_28px_rgba(34,34,34,0.1)] focus-visible:ring-2 focus-visible:ring-sunshine-dark sm:items-start sm:p-5 sm:text-left ${featured ? 'border-sunshine bg-sunshine' : 'border-[#e5e5e5] bg-white'}`}>
            <div className="flex w-full items-center justify-center gap-2 sm:justify-between">
              <span className="text-[10px] font-bold tracking-[0.12em] text-midnight">{tag}</span>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${featured ? 'bg-white' : 'bg-sunshine'}`}>
                <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </div>
            <h3 className="mt-4 text-base font-bold text-midnight">{title}</h3>
            <p className="mt-1 flex-1 text-sm leading-5 text-midnight">{text}</p>
            <span className="mt-4 inline-flex items-center justify-center gap-1 text-xs font-bold text-midnight group-hover:underline sm:justify-start">
              Explore tool <ArrowRight size={14} aria-hidden="true" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

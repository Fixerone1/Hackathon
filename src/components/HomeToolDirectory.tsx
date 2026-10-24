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
  { icon: ClipboardCheck, title: 'Skills assessment', text: 'See your strengths and choose what to grow next.', href: '/app/employment/assessment', tag: 'KNOW YOUR STRENGTHS', focus: ['work', 'study'] },
  { icon: FileText, title: 'CV Builder', text: 'Get your experience and skills ready to share.', href: '/app/employment/cv', tag: 'TELL YOUR STORY', focus: ['work'] },
  { icon: MessageCircle, title: 'Interview Coach', text: 'Get ready to show up with confidence.', href: '/app/employment/interview', tag: 'PREPARE FOR WORK', focus: ['work'] },
  { icon: BookOpen, title: 'Skills Academy', text: 'Explore practical activities to build your skills.', href: '/app/employment/academy', tag: 'KEEP LEARNING', focus: ['study', 'work'] },
  { icon: BriefcaseBusiness, title: 'Opportunities', text: 'Browse verified listings and keep track of your next move.', href: '/app/employment/opportunities', tag: 'FIND YOUR OPENING', focus: ['work', 'business'] },
  { icon: Route, title: 'Study & career pathways', text: 'Explore routes that can take you towards your goals.', href: '/app/employment/pathways', tag: 'PLAN WHAT’S NEXT', focus: ['study'] },
  { icon: Banknote, title: 'Money Skills', text: 'Build confidence with budgets, savings, and everyday choices.', href: '/app/money', tag: 'OWN YOUR MONEY', focus: ['money'] },
  { icon: Lightbulb, title: 'Growth Studio', text: 'Shape a business idea into a small first experiment.', href: '/app/growth', tag: 'START AN IDEA', focus: ['business'] },
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
          <Link key={title} href={href} className={`group flex min-h-48 flex-col rounded-3xl border p-4 transition hover:-translate-y-1 hover:border-sunshine-dark hover:shadow-[0_10px_28px_rgba(34,34,34,0.1)] focus-visible:ring-2 focus-visible:ring-sunshine-dark sm:p-5 ${featured ? 'border-sunshine bg-sunshine' : 'border-[#e5e5e5] bg-white'}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold tracking-[0.12em] text-midnight">{tag}</span>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${featured ? 'bg-white' : 'bg-sunshine'}`}>
                <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </div>
            <h3 className="mt-4 text-base font-bold text-midnight">{title}</h3>
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

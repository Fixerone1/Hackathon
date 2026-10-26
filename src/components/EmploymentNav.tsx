'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { employmentNavigation } from '@/lib/navigation';

export function EmploymentNav() {
  const pathname = usePathname();
  const primaryTabs = employmentNavigation.filter((item) => item.group === 'main');
  const toolTabs = employmentNavigation.filter((item) => item.group === 'tools');
  const activeTool = toolTabs.some((item) => pathname.startsWith(item.href));

  return (
    <div className="mb-6 border-b border-slate-200 pb-4">
      <nav aria-label="Employment sections" className="flex flex-wrap items-center gap-1.5">
        {primaryTabs.map(({ href, label }) => {
          const active = href === '/app/employment' ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm transition-colors ${active ? 'bg-sunshine-light font-bold text-black' : 'font-medium text-slate-700 hover:bg-slate-50'}`}
            >
              {label}
            </Link>
          );
        })}
        <details className="relative" open={activeTool || undefined}>
          <summary className={`flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-3 text-sm transition-colors [&::-webkit-details-marker]:hidden ${activeTool ? 'bg-sunshine-light font-bold text-black' : 'font-medium text-slate-700 hover:bg-slate-50'}`}>
            Tools <ChevronDown size={16} aria-hidden="true" />
          </summary>
          <nav aria-label="Career tools" className="mt-2 grid w-[min(22rem,calc(100vw-2rem))] grid-cols-1 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-card sm:absolute sm:left-0 sm:z-30 sm:grid-cols-2">
            {toolTabs.map(({ href, label, Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm transition-colors ${active ? 'bg-sunshine-light font-semibold text-black' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <Icon size={17} className="shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </details>
      </nav>
    </div>
  );
}

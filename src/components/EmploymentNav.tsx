'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { employmentNavigation } from '@/lib/navigation';

export function EmploymentNav() {
  const pathname = usePathname();
  const primaryTabs = employmentNavigation.filter((item) => item.group === 'main');
  const toolTabs = employmentNavigation.filter((item) => item.group === 'tools');

  return (
    <div className="mb-6 space-y-3 border-b border-slate-200 pb-4">
      <nav aria-label="Employment sections" className="grid grid-cols-3 gap-1.5 sm:flex sm:justify-center md:justify-start">
        {primaryTabs.map(({ href, label }) => {
          const active = href === '/app/employment' ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-h-11 min-w-0 items-center justify-center rounded-lg px-1 text-center text-[11px] leading-tight transition-colors sm:px-3 sm:text-sm ${active ? 'bg-[#2F2D29] font-bold text-white' : 'font-medium text-slate-700 hover:bg-slate-50'}`}
            >
              {label}
              {active && <span className="ml-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sunshine" aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>
      <nav aria-label="Career tools">
        <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-left">Work tools</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {toolTabs.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl border px-2 py-2 text-center text-xs leading-tight transition-colors last:col-span-2 last:mx-auto last:w-1/2 sm:last:col-span-1 sm:last:mx-0 sm:last:w-auto sm:text-sm ${active ? 'border-[#2F2D29] bg-[#2F2D29] font-semibold text-white' : 'border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50'}`}
              >
                <Icon size={17} className="shrink-0" aria-hidden="true" />
                <span>{label}</span>
                {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sunshine" aria-hidden="true" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

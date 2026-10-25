'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { employmentNavigation } from '@/lib/navigation';

export function EmploymentNav() {
  const pathname = usePathname();
  const primaryTabs = employmentNavigation.filter((item) => item.group === 'main');
  const toolTabs = employmentNavigation.filter((item) => item.group === 'tools');
  const isOnToolPage = toolTabs.some(({ href }) => pathname.startsWith(href));

  return (
    <nav aria-label="Employment Hub" className="mb-7 overflow-x-auto border-b border-slate-200">
      <div className="flex min-w-max items-center gap-1 py-2">
        {primaryTabs.map(({ href, label }) => {
          const active = href === '/app/employment' ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} aria-current={active ? 'page' : undefined}
            className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${active ? 'bg-sunshine-light font-bold text-black' : 'font-medium text-slate-700 hover:bg-slate-50'}`}>{label}</Link>;
        })}
        <details className="group relative">
          <summary className={`flex min-h-10 cursor-pointer list-none items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden ${isOnToolPage ? 'bg-sunshine-light font-bold text-black' : 'text-slate-700'}`}>
            More tools <ChevronDown size={15} className="ml-1 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="absolute left-0 top-full z-30 mt-1 grid min-w-52 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-card sm:left-auto sm:right-0">
            {toolTabs.map(({ href, label, Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                  className={`flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm ${active ? 'bg-sunshine-light font-semibold text-black' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <Icon size={16} aria-hidden="true" />{label}
                </Link>
              );
            })}
          </div>
        </details>
      </div>
    </nav>
  );
}

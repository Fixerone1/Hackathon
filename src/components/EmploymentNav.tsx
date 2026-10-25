'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { employmentNavigation } from '@/lib/navigation';

export function EmploymentNav() {
  const pathname = usePathname();
  const primaryTabs = employmentNavigation.filter((item) => item.group === 'main');
  const toolTabs = employmentNavigation.filter((item) => item.group === 'tools');

  return (
    <div className="mb-7 space-y-4 border-b border-slate-200 pb-5">
      <nav aria-label="Employment Hub" className="overflow-x-auto">
        <div className="flex min-w-max items-center gap-1 py-2">
          {primaryTabs.map(({ href, label }) => {
            const active = href === '/app/employment' ? pathname === href : pathname.startsWith(href);
            return <Link key={href} href={href} aria-current={active ? 'page' : undefined}
              className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${active ? 'bg-sunshine-light font-bold text-black' : 'font-medium text-slate-700 hover:bg-slate-50'}`}>{label}</Link>;
          })}
        </div>
      </nav>
      <nav aria-label="Work tools">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Work tools</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {toolTabs.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                className={`flex min-h-14 items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${active ? 'border-black bg-sunshine-light font-semibold text-black' : 'border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50'}`}>
                <Icon size={18} className="shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

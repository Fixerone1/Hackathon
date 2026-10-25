'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/app/employment', label: 'Overview' },
  { href: '/app/employment/assessment', label: 'Assessment' },
  { href: '/app/employment/cv', label: 'CV builder' },
  { href: '/app/employment/interview', label: 'Interview coach' },
  { href: '/app/employment/academy', label: 'Skills Academy' },
  { href: '/app/employment/opportunities', label: 'Opportunities' },
  { href: '/app/employment/pathways', label: 'Pathways' },
  { href: '/app/employment/applications', label: 'My applications' },
];

export function EmploymentNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Employment Hub" className="mb-7 -mx-1 overflow-x-auto">
      <div className="flex min-w-max gap-2 px-1 py-1">
        {tabs.map(({ href, label }) => {
          const active = href === '/app/employment' ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} aria-current={active ? 'page' : undefined}
            className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${active ? 'font-bold text-black' : 'font-medium text-slate-700 hover:bg-slate-50'}`}>{label}{active && <span className="h-1.5 w-1.5 rounded-full bg-emerald" aria-hidden="true" />}</Link>;
        })}
      </div>
    </nav>
  );
}

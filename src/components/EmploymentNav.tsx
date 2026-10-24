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
    <nav aria-label="Employment Hub" className="mb-7 overflow-x-auto border-b border-[#e5e5e5]">
      <div className="flex min-w-max gap-1 px-1">
        {tabs.map(({ href, label }) => {
          const active = href === '/app/employment' ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} aria-current={active ? 'page' : undefined}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${active ? 'border-sunshine-dark text-midnight' : 'border-transparent text-slate-600 hover:text-midnight'}`}>{label}</Link>;
        })}
      </div>
    </nav>
  );
}

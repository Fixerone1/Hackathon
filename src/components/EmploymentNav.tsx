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
            className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-sunshine text-midnight' : 'border border-[#e5e5e5] bg-white text-midnight hover:border-sunshine-dark hover:bg-sunshine-light'}`}>{label}</Link>;
        })}
      </div>
    </nav>
  );
}

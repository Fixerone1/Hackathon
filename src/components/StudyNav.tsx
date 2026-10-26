'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { studyNavigation } from '@/lib/navigation';
import { normalizePathname } from '@/lib/normalizePathname';

export function StudyNav() {
  const pathname = normalizePathname(usePathname() || '/');
  const [hash, setHash] = useState('');

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  return (
    <nav aria-label="Study sections" className="mb-6 border-b border-slate-200 pb-4">
      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-left">Study tools</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {studyNavigation.map(({ href, label, Icon }) => {
          const active = pathname === href.split('#')[0]
            && (href.endsWith('#admissions')
              ? hash === '#admissions'
              : href.endsWith('#bursaries')
                ? hash === '#bursaries' || !hash
                : true);
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl border px-2 py-2 text-center text-xs leading-tight transition-colors sm:text-sm ${active ? 'border-ink bg-ink font-semibold text-white' : 'border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50'}`}
            >
              <Icon size={17} className="shrink-0" aria-hidden="true" />
              <span>{label}</span>
              {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sunshine" aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

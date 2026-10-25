'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { normalizePathname } from '@/lib/normalizePathname';
import { workspaceNavigation } from '@/lib/navigation';

export function WorkspaceNav() {
  const pathname = normalizePathname(usePathname() || '/');

  return (
    <>
      <nav aria-label="Workspace sections" className="sticky top-[68px] z-20 hidden border-b border-slate-200 bg-white md:block">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
          {workspaceNavigation.map(({ href, label, Icon }) => {
            const active = href === '/app' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-4 text-sm transition-colors ${active ? 'bg-sunshine-light font-bold text-black' : 'font-medium text-slate-700 hover:bg-slate-50'}`}>
                <Icon size={17} strokeWidth={1.8} aria-hidden="true" />{label}{active && <span className="h-1.5 w-1.5 rounded-full bg-sunshine-dark" aria-hidden="true" />}
              </Link>
            );
          })}
        </div>
      </nav>
      <nav aria-label="Workspace sections" className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(10,10,10,0.08)] md:hidden">
        <div className="mx-auto flex max-w-xl">
          {workspaceNavigation.map(({ href, label, shortLabel, Icon }) => {
            const active = href === '/app' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined} aria-label={label}
                className={`flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-center text-[10px] font-medium leading-none transition-colors sm:text-[11px] ${active ? 'bg-sunshine-light font-bold text-black' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <Icon size={18} strokeWidth={active ? 2.2 : 1.7} aria-hidden="true" />
                <span className="whitespace-nowrap">{shortLabel}</span>
                {active && <span className="h-1 w-1 rounded-full bg-sunshine-dark" aria-hidden="true" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

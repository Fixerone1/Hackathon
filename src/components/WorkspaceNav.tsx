'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { normalizePathname } from '@/lib/normalizePathname';
import { workspaceNavigation } from '@/lib/navigation';

function isWorkspaceSectionActive(href: string, pathname: string): boolean {
  if (href === '/app') return pathname === href;
  if (href === '/app/study') {
    return pathname === href
      || pathname.startsWith(`${href}/`)
      || pathname === '/app/employment/pathways'
      || pathname === '/app/employment/academy';
  }
  if (href === '/app/employment') {
    return (pathname.startsWith(href) && pathname !== '/app/employment/pathways' && pathname !== '/app/employment/academy')
      || pathname === '/app/passport';
  }
  return pathname.startsWith(href);
}

export function WorkspaceNav() {
  const pathname = normalizePathname(usePathname() || '/');

  return (
    <>
      <nav aria-label="Workspace sections" className="sticky top-[68px] z-20 hidden border-b border-slate-200 bg-white md:block">
        <div className="mx-auto grid max-w-6xl grid-cols-6 gap-2 px-4 py-2 lg:px-8">
          {workspaceNavigation.map(({ href, label, shortLabel, Icon }) => {
            const active = isWorkspaceSectionActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl border px-2 text-xs transition-colors lg:text-sm ${active ? 'border-ink bg-ink font-bold text-white' : 'border-transparent font-medium text-slate-700 hover:border-slate-200 hover:bg-slate-50'}`}
              >
                <Icon size={18} strokeWidth={active ? 2.1 : 1.8} className="shrink-0" aria-hidden="true" />
                <span className="truncate lg:hidden">{shortLabel}</span>
                <span className="hidden truncate lg:inline">{label}</span>
                {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sunshine" aria-hidden="true" />}
              </Link>
            );
          })}
        </div>
      </nav>
      <nav aria-label="Workspace sections" className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(10,10,10,0.08)] backdrop-blur md:hidden">
        <div className="mx-auto grid w-full max-w-xl grid-cols-6">
          {workspaceNavigation.map(({ href, label, shortLabel, Icon }) => {
            const active = isWorkspaceSectionActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                aria-label={label}
                className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 px-0.5 text-center text-[10px] font-medium leading-none transition-colors sm:text-[11px] ${active ? 'bg-ink font-bold text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Icon size={19} strokeWidth={active ? 2.2 : 1.7} aria-hidden="true" />
                <span className="max-w-full truncate">{shortLabel}</span>
                {active && <span className="h-1 w-4 rounded-full bg-sunshine" aria-hidden="true" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

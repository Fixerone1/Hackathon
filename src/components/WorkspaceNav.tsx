'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Banknote, BriefcaseBusiness, ChartNoAxesCombined, LayoutDashboard, Settings, UserRound } from 'lucide-react';

const items = [
  { href: '/app', label: 'Dashboard', shortLabel: 'Home', Icon: LayoutDashboard },
  { href: '/app/employment', label: 'Employment Hub', shortLabel: 'Work', Icon: BriefcaseBusiness },
  { href: '/app/money', label: 'Money Skills', shortLabel: 'Money', Icon: Banknote },
  { href: '/app/growth', label: 'Growth Studio', shortLabel: 'Ideas', Icon: ChartNoAxesCombined },
  { href: '/app/profile', label: 'Profile', shortLabel: 'Profile', Icon: UserRound },
  { href: '/app/settings', label: 'Settings', shortLabel: 'Settings', Icon: Settings },
];

export function WorkspaceNav() {
  const pathname = usePathname();
  return (
    <>
      <nav aria-label="Workspace sections" className="hidden border-b border-[#e7e5dc] bg-white md:block">
        <div className="mx-auto flex max-w-6xl overflow-x-auto px-4">
          {items.map(({ href, label, Icon }) => {
            const active = href === '/app' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${active ? 'border-sunshine-dark text-midnight' : 'border-transparent text-slate-600 hover:text-midnight'}`}>
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />{label}
              </Link>
            );
          })}
        </div>
      </nav>
      <nav aria-label="Workspace sections" className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e7e5dc] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(36,39,36,0.08)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-xl">
          {items.map(({ href, label, shortLabel, Icon }) => {
            const active = href === '/app' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined} aria-label={label}
                className={`flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-[10px] font-medium transition-colors sm:text-[11px] ${active ? 'bg-sunshine-light text-midnight' : 'text-slate-600 hover:bg-surface hover:text-midnight'}`}>
                <Icon size={18} strokeWidth={active ? 2.2 : 1.7} aria-hidden="true" />
                <span className="max-w-full truncate">{shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

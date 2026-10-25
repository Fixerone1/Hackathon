'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Banknote,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  LayoutDashboard,
  Settings,
  UserRound,
} from 'lucide-react';

const items = [
  { href: '/app', label: 'Dashboard', shortLabel: 'Home', Icon: LayoutDashboard },
  { href: '/app/employment', label: 'Employment Hub', shortLabel: 'Work', Icon: BriefcaseBusiness },
  { href: '/app/money', label: 'Money Skills', shortLabel: 'Money', Icon: Banknote },
  { href: '/app/growth', label: 'Growth Studio', shortLabel: 'Ideas', Icon: ChartNoAxesCombined },
  { href: '/app/profile', label: 'My profile', shortLabel: 'Profile', Icon: UserRound },
  { href: '/app/settings', label: 'Settings', shortLabel: 'Settings', Icon: Settings },
];

export function WorkspaceNav() {
  const pathname = usePathname();

  return (
    <>
      <nav aria-label="Workspace sections" className="sticky top-[68px] z-20 hidden border-b border-[#e5e5e5] bg-white shadow-[0_2px_8px_rgba(34,34,34,0.05)] md:block">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
          {items.map(({ href, label, Icon }) => {
            const active = href === '/app' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${active ? 'bg-sunshine text-midnight' : 'text-midnight hover:bg-sunshine-light'}`}>
                <Icon size={17} strokeWidth={1.8} aria-hidden="true" />{label}
              </Link>
            );
          })}
        </div>
      </nav>
      <nav aria-label="Workspace sections" className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e5e5e5] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(34,34,34,0.08)] md:hidden">
        <div className="mx-auto flex max-w-xl">
          {items.map(({ href, label, shortLabel, Icon }) => {
            const active = href === '/app' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined} aria-label={label}
                className={`flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-center text-[10px] font-medium leading-none transition-colors sm:text-[11px] ${active ? 'bg-sunshine-light text-midnight' : 'text-slate-600 hover:bg-surface hover:text-midnight'}`}>
                <Icon size={17} strokeWidth={active ? 2.2 : 1.7} aria-hidden="true" />
                <span className="whitespace-nowrap">{shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

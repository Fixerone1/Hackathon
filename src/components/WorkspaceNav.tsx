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
      <nav aria-label="Workspace sections" className="fixed bottom-0 left-0 top-[68px] z-20 hidden w-60 flex-col border-r border-white/10 bg-[#0D1B2A] md:flex">
        <div className="px-5 pb-3 pt-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
        </div>
        <div className="flex flex-col gap-1 px-3">
          {items.map(({ href, label, Icon }) => {
            const active = href === '/app' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${active ? 'bg-[#1B263B] text-white before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r before:bg-sunshine' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                <Icon size={17} strokeWidth={1.8} aria-hidden="true" />{label}
              </Link>
            );
          })}
        </div>
        <div className="mt-auto border-t border-white/10 px-5 py-4 text-xs leading-5 text-slate-400">
          Your next step, at your pace.
        </div>
      </nav>
      <nav aria-label="Workspace sections" className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald/50 bg-[#0D1B2A] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(13,27,42,0.2)] md:hidden">
        <div className="mx-auto flex max-w-xl">
          {items.map(({ href, label, shortLabel, Icon }) => {
            const active = href === '/app' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined} aria-label={label}
                className={`flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-center text-[9px] font-semibold leading-none transition-colors sm:text-[10px] ${active ? 'bg-[#FFE500] text-[#0D1B2A]' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
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

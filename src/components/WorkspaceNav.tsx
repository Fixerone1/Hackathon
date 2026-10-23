'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Banknote, BriefcaseBusiness, ChartNoAxesCombined, LayoutDashboard, Settings, UserRound } from 'lucide-react';

const items = [
  { href: '/app', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/app/employment', label: 'Employment Hub', Icon: BriefcaseBusiness },
  { href: '/app/money', label: 'Money Skills', Icon: Banknote },
  { href: '/app/growth', label: 'Growth Studio', Icon: ChartNoAxesCombined },
  { href: '/app/profile', label: 'Profile', Icon: UserRound },
  { href: '/app/settings', label: 'Settings', Icon: Settings },
];

export function WorkspaceNav() {
  const pathname = usePathname();
  return (
    <>
      <nav aria-label="Workspace sections" className="hidden border-b border-slate-200 bg-white md:block">
        <div className="mx-auto flex max-w-6xl overflow-x-auto px-4">
          {items.map(({ href, label, Icon }) => {
            const active = href === '/app' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${active ? 'border-emerald text-midnight' : 'border-transparent text-slate-600 hover:text-midnight'}`}>
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />{label}
              </Link>
            );
          })}
        </div>
      </nav>
      <nav aria-label="Workspace sections" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {items.map(({ href, label, Icon }) => {
          const active = href === '/app' ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={active ? 'page' : undefined} aria-label={label}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium ${active ? 'text-emerald-dark' : 'text-slate-600'}`}>
              <Icon size={18} strokeWidth={active ? 2.2 : 1.7} aria-hidden="true" />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

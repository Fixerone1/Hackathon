'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Banknote,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  LayoutDashboard,
  MoreHorizontal,
  Settings,
  X,
  UserRound,
} from 'lucide-react';

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
  const [toolsOpen, setToolsOpen] = useState(false);
  const mobileNavRef = useRef<HTMLElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const inTools = pathname.startsWith('/app/employment/')
    || pathname === '/app/employment'
    || pathname === '/app/money'
    || pathname === '/app/growth'
    || pathname === '/app/profile'
    || pathname === '/app/settings';

  useEffect(() => {
    setToolsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!toolsOpen) return;

    function closeOnOutsidePress(event: PointerEvent) {
      if (event.target instanceof Node
        && !mobileNavRef.current?.contains(event.target)
        && !toolsMenuRef.current?.contains(event.target)) {
        setToolsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setToolsOpen(false);
    }

    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [toolsOpen]);

  return (
    <>
      <nav aria-label="Workspace sections" className="hidden border-b border-[#e5e5e5] bg-white md:block">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
          {items.map(({ href, label, Icon }) => {
            const active = href === '/app' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-sunshine text-midnight' : 'text-midnight hover:bg-sunshine-light'}`}>
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />{label}
              </Link>
            );
          })}
        </div>
      </nav>
      <nav ref={mobileNavRef} aria-label="Workspace sections" className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e5e5e5] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(34,34,34,0.08)] md:hidden">
        <div className="mx-auto flex max-w-xl">
          {items.slice(0, 4).map(({ href, label, shortLabel, Icon }) => {
            const active = href === '/app' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined} aria-label={label}
                className={`flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-center text-[10px] font-medium leading-none transition-colors sm:text-[11px] ${active ? 'bg-sunshine-light text-midnight' : 'text-slate-600 hover:bg-surface hover:text-midnight'}`}>
                <Icon size={18} strokeWidth={active ? 2.2 : 1.7} aria-hidden="true" />
                <span className="whitespace-nowrap">{shortLabel}</span>
              </Link>
            );
          })}
          <button type="button" aria-label="More navigation" aria-expanded={toolsOpen}
            aria-controls="workspace-tools-menu"
            onClick={() => setToolsOpen((open) => !open)}
            className={`flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-center text-[10px] font-medium leading-none transition-colors sm:text-[11px] ${toolsOpen || inTools ? 'bg-sunshine-light text-midnight' : 'text-midnight hover:bg-sunshine-light'}`}>
            <MoreHorizontal size={18} strokeWidth={toolsOpen || inTools ? 2.2 : 1.7} aria-hidden="true" />
            <span className="whitespace-nowrap">More</span>
          </button>
        </div>
      </nav>
      {toolsOpen && (
        <div ref={toolsMenuRef} id="workspace-tools-menu"
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-1/2 z-[60] max-h-[min(70dvh,36rem)] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 overflow-y-auto rounded-2xl border border-[#e5e5e5] bg-white px-4 pb-4 pt-3 shadow-[0_-8px_24px_rgba(34,34,34,0.16)] md:hidden">
          <div className="mx-auto">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-midnight">More navigation</h2>
              <button type="button" aria-label="Close tools menu" onClick={() => setToolsOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-slate-600 transition hover:bg-surface hover:text-midnight">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <Link href="/#tools" className="mb-3 flex min-h-12 items-center justify-between rounded-xl border border-sunshine-dark bg-sunshine px-4 py-3 text-sm font-semibold text-midnight">
              Browse all tools <span aria-hidden="true">→</span>
            </Link>
            <h2 className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-midnight">Account</h2>
            <div className="grid grid-cols-2 gap-2">
              {items.slice(4).map(({ href, label, Icon }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                    className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${active ? 'border-sunshine-dark bg-sunshine-light text-midnight' : 'border-[#e5e5e5] text-midnight hover:bg-sunshine-light'}`}>
                    <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

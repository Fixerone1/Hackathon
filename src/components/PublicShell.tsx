'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { AccountMenu } from '@/components/AccountMenu';
import { BrandLogo } from '@/components/BrandLogo';
import { DashboardNotifications } from '@/components/DashboardNotifications';
import { WorkspaceNav } from '@/components/WorkspaceNav';
import { normalizePathname } from '@/lib/normalizePathname';

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.97V9.2h2.96v9.55ZM6.45 7.9a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm12.3 10.85h-2.95V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.5V9.2h2.84v1.3h.04c.4-.75 1.36-1.55 2.8-1.55 3 0 3.57 1.97 3.57 4.53v5.27Z"/>
    </svg>
  );
}

export function PublicShell({ children, variant = 'public' }: { children: ReactNode; variant?: 'public' | 'workspace' }) {
  const pathname = normalizePathname(usePathname() || '/');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workspaceUserId, setWorkspaceUserId] = useState<string | null>(null);
  const linkedInUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL;
  const handleUserChange = useCallback((_signedIn: boolean, userId?: string) => {
    setWorkspaceUserId(userId || null);
  }, []);

  return (
    <>
      <header className="site-header sticky top-0 z-30 border-b border-slate-200 bg-white text-slate-950 shadow-[0_3px_14px_rgba(10,10,10,0.07)]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:min-h-[68px] sm:gap-4 sm:px-6 lg:px-8">
          <Link href={variant === 'workspace' ? '/app' : '/'} className="flex shrink-0 items-center gap-2.5 rounded-xl font-bold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunshine-dark focus-visible:ring-offset-2 sm:gap-3" aria-label={variant === 'workspace' ? 'Ukukhanya dashboard' : 'Ukukhanya home'}>
            <span className="grid h-10 w-12 place-items-center overflow-hidden rounded-xl bg-white p-1 sm:h-11 sm:w-14">
              <BrandLogo className="h-full w-full object-contain" />
            </span>
            <span className="text-base sm:text-lg">Ukukhanya</span>
          </Link>
          {variant === 'public' ? (
            <nav aria-label="Main navigation" className="hidden min-w-0 items-center justify-end gap-1 text-sm font-medium md:flex">
              <AccountMenu compact onUserChange={handleUserChange} />
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm font-medium text-slate-600 sm:inline">Learner workspace</span>
              {workspaceUserId && <DashboardNotifications userId={workspaceUserId} />}
              <AccountMenu compact onUserChange={handleUserChange} />
            </div>
          )}
          {variant === 'public' && (
            <button type="button" className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-black hover:bg-slate-50 md:hidden" aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>
              {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          )}
        </div>
        {variant === 'public' && mobileMenuOpen && <nav aria-label="Mobile navigation" className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="mx-auto grid max-w-6xl gap-1">
            {[
              ['/', 'Home'], ['/login', 'Sign in'], ['/signup', 'Create account'],
            ].map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} onClick={() => setMobileMenuOpen(false)} className={`flex min-h-11 items-center justify-between rounded-lg px-3 text-sm ${pathname === href ? 'font-bold text-black' : 'text-slate-700 hover:bg-slate-50'}`}>
              {label}{pathname === href && <span className="h-1.5 w-1.5 rounded-full bg-emerald" aria-hidden="true" />}
            </Link>)}
          </div>
        </nav>}
      </header>
      {variant === 'workspace' && <WorkspaceNav />}
      <main id="main-content" className="min-h-[50vh] bg-canvas">{children}</main>
      <footer className={`site-footer relative isolate overflow-hidden ${variant === 'workspace' ? 'pb-20 md:pb-0' : ''}`}>
        <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/careerforge-people.jpg`} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 pb-6 pt-10 sm:px-6 sm:pb-7 sm:pt-12 lg:px-8">
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr] lg:gap-14">
            <div className="max-w-sm">
              <Link href={variant === 'workspace' ? '/app' : '/'} className="inline-flex items-center gap-3 rounded-sm font-bold text-midnight" aria-label={variant === 'workspace' ? 'Ukukhanya dashboard' : 'Ukukhanya home'}>
                <span className="grid h-11 w-14 place-items-center overflow-hidden rounded-xl bg-white p-1">
                <BrandLogo className="h-full w-full object-contain" />
                </span>
                <span className="text-lg">Ukukhanya</span>
              </Link>
              <p className="mt-4 text-sm leading-6 text-midnight">
                A practical starting point for work readiness, money confidence, and your next steps.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-slate-200">
                <span className="h-2 w-2 rounded-full bg-sunshine-dark" aria-hidden="true" />
                South African youth-mobility prototype
              </span>
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-midnight">Connect with us</p>
                {linkedInUrl && /^https:\/\/(www\.)?linkedin\.com\//i.test(linkedInUrl) ? (
                  <a
                    href={linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ukukhanya on LinkedIn (opens in a new tab)"
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald px-4 text-sm font-semibold text-black transition hover:bg-emerald-300 focus-visible:outline-white"
                  >
                    <LinkedInMark />
                    LinkedIn
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                ) : (
                  <span
                    title="Set NEXT_PUBLIC_LINKEDIN_URL to your official LinkedIn page"
                    aria-label="LinkedIn profile link not configured"
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold text-slate-200"
                  >
                    <LinkedInMark />
                    LinkedIn
                    <span className="text-xs font-normal text-midnight">Coming soon</span>
                  </span>
                )}
              </div>
            </div>

            <nav aria-label="Explore Ukukhanya">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-midnight">Explore</h2>
              <ul className="mt-4 space-y-3 text-sm text-midnight">
                <li><Link href="/#learner-paths" className="transition-colors hover:bg-sunshine-light">Who we support</Link></li>
                <li><Link href="/#tools" className="transition-colors hover:bg-sunshine-light">Explore the tools</Link></li>
                <li><Link href="/privacy" className="transition-colors hover:bg-sunshine-light">Privacy and trust</Link></li>
              </ul>
            </nav>

            <nav aria-label="Account and privacy">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-midnight">Your account</h2>
              <ul className="mt-4 space-y-3 text-sm text-midnight">
                {variant === 'workspace' ? (
                  <>
                    <li><Link href="/app/profile" className="transition-colors hover:bg-sunshine-light">Your profile</Link></li>
                    <li><Link href="/app/settings" className="transition-colors hover:bg-sunshine-light">Account settings</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/login" className="transition-colors hover:bg-sunshine-light">Sign in</Link></li>
                    <li><Link href="/signup" className="transition-colors hover:bg-sunshine-light">Get started</Link></li>
                  </>
                )}
                <li><Link href="/privacy" className="transition-colors hover:bg-sunshine-light">Privacy notice</Link></li>
              </ul>
            </nav>
          </div>

          <div className="mt-9 flex flex-col gap-3 border-t border-white/20 pt-5 text-xs leading-5 text-midnight sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
            <p>Opportunities open on the original provider’s site. You choose what to share and when to apply.</p>
            <p className="shrink-0">© Ukukhanya</p>
          </div>
        </div>
      </footer>
    </>
  );
}
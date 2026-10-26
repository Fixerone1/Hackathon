'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { AccountMenu } from '@/components/AccountMenu';
import { BrandLogo } from '@/components/BrandLogo';
import { DashboardNotifications } from '@/components/DashboardNotifications';
import { GooglePrivacyConsentBridge } from '@/components/GooglePrivacyConsentBridge';
import { WorkspaceNav } from '@/components/WorkspaceNav';

export function PublicShell({ children, variant = 'public' }: { children: ReactNode; variant?: 'public' | 'workspace' }) {
  const [workspaceUserId, setWorkspaceUserId] = useState<string | null>(null);
  const handleUserChange = useCallback((_signedIn: boolean, userId?: string) => {
    setWorkspaceUserId(userId || null);
  }, []);

  return (
    <>
      {variant === 'workspace' && <GooglePrivacyConsentBridge />}
      <header className="site-header sticky top-0 z-30 border-b border-slate-800 bg-black text-white shadow-[0_3px_14px_rgba(10,10,10,0.18)]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:min-h-[68px] sm:gap-4 sm:px-6 lg:px-8">
          <Link href={variant === 'workspace' ? '/app' : '/'} className="flex shrink-0 items-center gap-2.5 rounded-xl font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunshine-dark focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:gap-3" aria-label={variant === 'workspace' ? 'Ukukhanya dashboard' : 'Ukukhanya home'}>
            <span className="grid h-10 w-12 place-items-center overflow-hidden rounded-xl bg-white p-1 sm:h-11 sm:w-14">
              <BrandLogo className="h-full w-full object-contain" />
            </span>
            <span className="text-base sm:text-lg">Ukukhanya</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {variant === 'public' && workspaceUserId && (
              <Link href="/app" className="btn-primary min-h-10 gap-2 px-3 text-sm" aria-label="Open your dashboard">
                <LayoutDashboard size={16} aria-hidden="true" />
                Dashboard
              </Link>
            )}
            {variant === 'workspace' && workspaceUserId && <DashboardNotifications userId={workspaceUserId} />}
            <AccountMenu compact publicNavigation={variant === 'public'} onUserChange={handleUserChange} />
          </div>
        </div>
      </header>
      {variant === 'workspace' && <WorkspaceNav />}
      <main id="main-content" className={`min-h-[50vh] bg-canvas ${variant === 'workspace' ? 'pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0' : ''}`}>{children}</main>
      <footer className="site-footer relative isolate overflow-hidden">
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
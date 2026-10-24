import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight, BriefcaseBusiness } from 'lucide-react';

export function PublicShell({ children, variant = 'public' }: { children: ReactNode; variant?: 'public' | 'workspace' }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-50 rounded bg-white p-3 text-midnight focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-[#e7e5dc] bg-white/95 shadow-[0_2px_12px_rgba(36,39,36,0.04)] backdrop-blur">
        <div className="mx-auto flex min-h-[64px] max-w-6xl items-center justify-between gap-2 px-3 sm:min-h-[68px] sm:gap-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 font-bold text-midnight sm:gap-3" aria-label="CareerForge home">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-sunshine text-midnight ring-4 ring-sunshine-light sm:h-9 sm:w-9">
              <BriefcaseBusiness size={18} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="text-sm sm:text-base">CareerForge</span>
          </Link>
          {variant === 'public' ? (
            <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-0.5 text-xs font-medium sm:gap-2 sm:text-sm">
              <Link href="/how-it-works" className="hidden rounded-lg px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-midnight lg:inline-flex">
                How it works
              </Link>
              <Link href="/opportunities" className="hidden rounded-lg px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-midnight sm:inline-flex">
                Opportunities
              </Link>
              <Link href="/partners" className="hidden rounded-lg px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-midnight lg:inline-flex">
                For organizations
              </Link>
              <Link href="/about" className="hidden rounded-lg px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-midnight lg:inline-flex">
                About
              </Link>
              <details className="relative lg:hidden">
                <summary className="flex min-h-10 cursor-pointer list-none items-center rounded-lg px-2.5 text-slate-700 transition-colors hover:bg-slate-100 hover:text-midnight marker:hidden">
                  <span>Menu</span>
                </summary>
                <div className="absolute right-0 top-full z-40 mt-2 grid min-w-48 gap-1 rounded-xl border border-slate-200 bg-white p-2 text-sm shadow-lg">
                  <Link href="/how-it-works" className="rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-midnight">How it works</Link>
                  <Link href="/opportunities" className="rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-midnight">Opportunities</Link>
                  <Link href="/partners" className="rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-midnight">For organizations</Link>
                  <Link href="/about" className="rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-midnight">About</Link>
                  <Link href="/privacy" className="rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-midnight">Privacy</Link>
                </div>
              </details>
              <Link href="/login" className="whitespace-nowrap rounded-lg px-2 py-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-midnight sm:px-3">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary min-h-10 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs sm:px-3 sm:text-sm">
                <span className="sm:hidden">Join</span><span className="hidden sm:inline">Get started</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </nav>
          ) : (
            <span className="text-sm font-medium text-slate-600">Learner workspace</span>
          )}
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className={`border-t border-[#343832] bg-[#242724] text-white ${variant === 'workspace' ? 'pb-20 md:pb-0' : ''}`}>
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-10 sm:px-6 sm:pb-7 sm:pt-12 lg:px-8">
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr] lg:gap-14">
            <div className="max-w-sm">
              <Link href="/" className="inline-flex items-center gap-3 rounded-sm font-bold text-white focus-visible:outline-white" aria-label="CareerForge home">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-sunshine text-midnight ring-4 ring-white/10">
                  <BriefcaseBusiness size={19} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="text-lg">CareerForge</span>
              </Link>
              <p className="mt-4 text-sm leading-6 text-white/70">
                A practical starting point for work readiness, money confidence, and your next steps.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-white/75">
                <span className="h-2 w-2 rounded-full bg-sunshine" aria-hidden="true" />
                South African youth-mobility prototype
              </span>
            </div>

            <nav aria-label="Explore CareerForge">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-sunshine">Explore</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                <li><Link href="/how-it-works" className="transition-colors hover:text-sunshine focus-visible:text-sunshine">How it works</Link></li>
                <li><Link href="/opportunities" className="transition-colors hover:text-sunshine focus-visible:text-sunshine">Opportunities</Link></li>
                <li><Link href="/partners" className="transition-colors hover:text-sunshine focus-visible:text-sunshine">For organizations</Link></li>
                <li><Link href="/about" className="transition-colors hover:text-sunshine focus-visible:text-sunshine">About CareerForge</Link></li>
              </ul>
            </nav>

            <nav aria-label="Account and privacy">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-sunshine">Your account</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                {variant === 'workspace' ? (
                  <>
                    <li><Link href="/app/profile" className="transition-colors hover:text-sunshine focus-visible:text-sunshine">Your profile</Link></li>
                    <li><Link href="/app/settings" className="transition-colors hover:text-sunshine focus-visible:text-sunshine">Account settings</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/login" className="transition-colors hover:text-sunshine focus-visible:text-sunshine">Sign in</Link></li>
                    <li><Link href="/signup" className="transition-colors hover:text-sunshine focus-visible:text-sunshine">Get started</Link></li>
                  </>
                )}
                <li><Link href="/privacy" className="transition-colors hover:text-sunshine focus-visible:text-sunshine">Privacy notice</Link></li>
              </ul>
            </nav>
          </div>

          <div className="mt-9 flex flex-col gap-3 border-t border-white/15 pt-5 text-xs leading-5 text-white/55 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
            <p>Opportunities open on the original provider’s site. You choose what to share and when to apply.</p>
            <p className="shrink-0">© CareerForge</p>
          </div>
        </div>
      </footer>
    </>
  );
}
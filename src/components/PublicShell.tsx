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
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-[64px] max-w-6xl items-center justify-between gap-2 px-3 sm:min-h-[68px] sm:gap-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 font-bold text-midnight sm:gap-3" aria-label="CareerForge home">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-midnight text-white sm:h-9 sm:w-9">
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
      <footer className={`border-t border-slate-200 bg-white ${variant === 'workspace' ? 'pb-20 md:pb-0' : ''}`}>
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="font-semibold text-midnight">CareerForge AI</p>
            <p className="mt-1">Work readiness, money confidence, and practical next steps.</p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <Link href="/how-it-works" className="hover:text-midnight">How it works</Link>
            <Link href="/opportunities" className="hover:text-midnight">Opportunities</Link>
            <Link href="/partners" className="hover:text-midnight">For partners</Link>
            <Link href="/about" className="hover:text-midnight">About</Link>
            <Link href="/privacy" className="hover:text-midnight">Privacy</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
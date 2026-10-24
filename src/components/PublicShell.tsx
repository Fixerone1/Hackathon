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
        <div className="mx-auto flex min-h-[68px] max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-3 font-bold text-midnight" aria-label="CareerForge home">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-midnight text-white">
              <BriefcaseBusiness size={18} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span>CareerForge</span>
          </Link>
          {variant === 'public' ? (
            <nav aria-label="Main navigation" className="flex items-center gap-1 text-sm font-medium sm:gap-2">
              <Link href="/how-it-works" className="hidden rounded-lg px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-midnight sm:inline-flex">
                How it works
              </Link>
              <Link href="/opportunities" className="rounded-lg px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-midnight">
                Opportunities
              </Link>
              <Link href="/partners" className="hidden rounded-lg px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-midnight lg:inline-flex">
                For organizations
              </Link>
              <Link href="/about" className="hidden rounded-lg px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-midnight lg:inline-flex">
                About
              </Link>
              <Link href="/login" className="rounded-lg px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-midnight">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary min-h-10 rounded-lg px-3 py-2">
                Get started <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </nav>
          ) : (
            <span className="text-sm font-medium text-slate-600">Learner workspace</span>
          )}
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
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
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
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[68px] max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-3 font-bold text-midnight" aria-label="CareerForge home">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-midnight text-white">
              <BriefcaseBusiness size={18} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span>CareerForge</span>
          </Link>
          {variant === 'public' ? (
            <nav aria-label="Main navigation" className="flex items-center gap-1 text-sm font-medium sm:gap-2">
              <Link href="/#organizations" className="hidden rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-midnight sm:inline-flex">
                For organizations
              </Link>
              <Link href="/login" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-midnight">
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
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 text-sm text-slate-500">
          <span>CareerForge AI</span>
          <span>Work readiness, money confidence, and practical next steps.</span>
        </div>
      </footer>
    </>
  );
}
import Link from 'next/link';
import type { ReactNode } from 'react';

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-50 rounded bg-white p-3 text-midnight focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-3 font-bold text-midnight" aria-label="CareerForge home">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald text-sm text-midnight">CF</span>
            <span>CareerForge</span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-2 text-sm font-medium">
            <Link href="/app" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-midnight">
              Demo app
            </Link>
            <Link href="/signup" className="btn-primary min-h-10 rounded-lg px-3 py-2">
              Get started
            </Link>
          </nav>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 text-sm text-slate-500">
          <span>CareerForge AI</span>
          <span>Built for young people building their next opportunity.</span>
        </div>
      </footer>
    </>
  );
}
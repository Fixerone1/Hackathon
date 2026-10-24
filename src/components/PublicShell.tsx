'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, BriefcaseBusiness } from 'lucide-react';
import { WorkspaceNav } from '@/components/WorkspaceNav';

const bannerLabels: Record<string, string> = {
  '/': 'A brighter path forward',
  '/about': 'About CareerForge',
  '/how-it-works': 'Your step-by-step journey',
  '/opportunities': 'Find your next opportunity',
  '/partners': 'Building opportunity together',
  '/privacy': 'Your information, your choices',
  '/login': 'Welcome back',
  '/signup': 'Start with your next step',
  '/app': 'Your learner workspace',
  '/app/employment': 'Build your work readiness',
  '/app/employment/assessment': 'Understand your strengths',
  '/app/employment/cv': 'Tell your story with confidence',
  '/app/employment/interview': 'Prepare for your next conversation',
  '/app/employment/academy': 'Grow practical skills',
  '/app/employment/opportunities': 'Explore opportunities',
  '/app/employment/pathways': 'Explore your pathways',
  '/app/employment/applications': 'Keep your applications moving',
  '/app/profile': 'Make your profile yours',
  '/app/settings': 'Your account, your preferences',
  '/app/money': 'Build money confidence',
  '/app/growth': 'Move an idea forward',
  '/admin': 'Opportunity administration',
};

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.97V9.2h2.96v9.55ZM6.45 7.9a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm12.3 10.85h-2.95V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.5V9.2h2.84v1.3h.04c.4-.75 1.36-1.55 2.8-1.55 3 0 3.57 1.97 3.57 4.53v5.27Z"/>
    </svg>
  );
}

export function PublicShell({ children, variant = 'public' }: { children: ReactNode; variant?: 'public' | 'workspace' }) {
  const pathname = usePathname() || '/';
  const bannerLabel = bannerLabels[pathname]
    || (pathname.startsWith('/app/employment/') ? 'Your employment journey' : 'Your next step starts here');
  const linkedInUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL;
  const bannerImage = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/careerforge-people.jpg`;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-50 rounded bg-white p-3 text-midnight focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-midnight text-white shadow-[0_2px_16px_rgba(0,0,0,0.18)]">
        <div className="mx-auto flex min-h-[64px] max-w-6xl items-center justify-between gap-2 px-3 sm:min-h-[68px] sm:gap-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 font-bold text-white sm:gap-3" aria-label="CareerForge home">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-sunshine text-midnight ring-4 ring-white/10 sm:h-9 sm:w-9">
              <BriefcaseBusiness size={18} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="text-sm sm:text-base">CareerForge</span>
          </Link>
          {variant === 'public' ? (
            <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-0.5 text-xs font-medium sm:gap-2 sm:text-sm">
              <Link href="/how-it-works" className="hidden rounded-lg px-3 py-2 text-white/75 transition-colors hover:bg-white/10 hover:text-sunshine lg:inline-flex">
                How it works
              </Link>
              <Link href="/opportunities" className="hidden rounded-lg px-3 py-2 text-white/75 transition-colors hover:bg-white/10 hover:text-sunshine sm:inline-flex">
                Opportunities
              </Link>
              <Link href="/partners" className="hidden rounded-lg px-3 py-2 text-white/75 transition-colors hover:bg-white/10 hover:text-sunshine lg:inline-flex">
                For organizations
              </Link>
              <Link href="/about" className="hidden rounded-lg px-3 py-2 text-white/75 transition-colors hover:bg-white/10 hover:text-sunshine lg:inline-flex">
                About
              </Link>
              <details className="relative lg:hidden">
                <summary className="flex min-h-10 cursor-pointer list-none items-center rounded-lg px-2.5 text-white/85 transition-colors hover:bg-white/10 hover:text-sunshine marker:hidden">
                  <span>Menu</span>
                </summary>
                <div className="absolute right-0 top-full z-40 mt-2 grid min-w-48 gap-1 rounded-xl border border-white/15 bg-midnight p-2 text-sm shadow-xl">
                  <Link href="/how-it-works" className="rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-sunshine">How it works</Link>
                  <Link href="/opportunities" className="rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-sunshine">Opportunities</Link>
                  <Link href="/partners" className="rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-sunshine">For organizations</Link>
                  <Link href="/about" className="rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-sunshine">About</Link>
                  <Link href="/privacy" className="rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-sunshine">Privacy</Link>
                </div>
              </details>
              <Link href="/login" className="whitespace-nowrap rounded-lg px-2 py-2 text-white/85 transition-colors hover:bg-white/10 hover:text-sunshine sm:px-3">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary min-h-10 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs sm:px-3 sm:text-sm">
                <span className="sm:hidden">Join</span><span className="hidden sm:inline">Get started</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </nav>
          ) : (
            <span className="text-sm font-medium text-sunshine">Learner workspace</span>
          )}
        </div>
      </header>
      {variant === 'workspace' && <WorkspaceNav />}
      {!(variant === 'public' && pathname === '/') && (
        <section
          aria-label={`${bannerLabel} banner`}
          className="relative isolate h-36 overflow-hidden border-b border-black/10 bg-midnight sm:h-48 lg:h-56"
        >
          <img
            src={bannerImage}
            alt=""
            aria-hidden="true"
            width={612}
            height={245}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/85 to-midnight/35" />
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-2 bg-sunshine sm:w-3" />
          <div className="pointer-events-none absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sunshine">CareerForge <span aria-hidden="true" className="text-white/60">/</span> Your journey</p>
                <h2 className="mt-2 max-w-xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {bannerLabel}
                </h2>
              </div>
            </div>
          </div>
        </section>
      )}
      <main id="main-content" className="bg-[#fffdf0]">{children}</main>
      <footer className={`border-t border-[#333333] bg-[#222222] text-white ${variant === 'workspace' ? 'pb-20 md:pb-0' : ''}`}>
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
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Connect with us</p>
                {linkedInUrl && /^https:\/\/(www\.)?linkedin\.com\//i.test(linkedInUrl) ? (
                  <a
                    href={linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="CareerForge on LinkedIn (opens in a new tab)"
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-sunshine px-4 text-sm font-semibold text-black transition hover:bg-[#f0d600] focus-visible:outline-white"
                  >
                    <LinkedInMark />
                    LinkedIn
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                ) : (
                  <span
                    title="Set NEXT_PUBLIC_LINKEDIN_URL to your official LinkedIn page"
                    aria-label="LinkedIn profile link not configured"
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold text-white/70"
                  >
                    <LinkedInMark />
                    LinkedIn
                    <span className="text-xs font-normal text-white/50">Coming soon</span>
                  </span>
                )}
              </div>
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
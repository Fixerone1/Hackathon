'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, BriefcaseBusiness } from 'lucide-react';
import { AccountMenu } from '@/components/AccountMenu';
import { WorkspaceNav } from '@/components/WorkspaceNav';

const bannerLabels: Record<string, string> = {
  '/': 'Build your next step',
  '/about': 'About CareerForge',
  '/how-it-works': 'How CareerForge works',
  '/opportunities': 'Explore opportunities',
  '/partners': 'Partner with us',
  '/privacy': 'Privacy at CareerForge',
  '/login': 'Sign in to CareerForge',
  '/signup': 'Create your account',
  '/app': 'Your dashboard',
  '/app/employment': 'Work and career tools',
  '/app/employment/assessment': 'Skills assessment',
  '/app/employment/cv': 'Build your CV',
  '/app/employment/interview': 'Interview practice',
  '/app/employment/academy': 'Learn new skills',
  '/app/employment/opportunities': 'Find opportunities',
  '/app/employment/pathways': 'Study and career paths',
  '/app/employment/applications': 'Your applications',
  '/app/profile': 'Your learner profile',
  '/app/settings': 'Account settings',
  '/app/money': 'Money skills',
  '/app/growth': 'Business ideas',
  '/admin': 'Manage opportunities',
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
  const [signedIn, setSignedIn] = useState(false);
  const bannerLabel = bannerLabels[pathname]
    || (pathname.startsWith('/app/employment/') ? 'Work and career tools' : 'Your next step');
  const linkedInUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL;
  const bannerImages: Record<string, string> = {
    '/about': 'careerforge-people.jpg',
    '/how-it-works': 'careerforge-students.jpg',
    '/opportunities': 'careerforge-founders.jpg',
    '/partners': 'careerforge-founders.jpg',
    '/app': 'careerforge-people.jpg',
    '/app/employment': 'careerforge-people.jpg',
    '/app/employment/assessment': 'careerforge-students.jpg',
    '/app/employment/cv': 'careerforge-founders.jpg',
    '/app/employment/interview': 'careerforge-founders.jpg',
    '/app/employment/academy': 'careerforge-students.jpg',
    '/app/employment/opportunities': 'careerforge-people.jpg',
    '/app/employment/pathways': 'careerforge-students.jpg',
    '/app/employment/applications': 'careerforge-founders.jpg',
    '/app/money': 'careerforge-people.jpg',
    '/app/growth': 'careerforge-founders.jpg',
  };
  const bannerImage = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/${bannerImages[pathname] || 'careerforge-people.jpg'}`;

  return (
    <>
      <header className="sticky top-0 z-30 border-b-4 border-sunshine bg-white text-midnight shadow-[0_2px_12px_rgba(34,34,34,0.06)]">
        <div className="mx-auto flex min-h-[64px] max-w-6xl items-center justify-between gap-2 px-3 sm:min-h-[68px] sm:gap-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 font-bold text-midnight sm:gap-3" aria-label="CareerForge home">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-sunshine text-midnight ring-4 ring-sunshine-light sm:h-9 sm:w-9">
              <BriefcaseBusiness size={18} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="text-sm sm:text-base">CareerForge</span>
          </Link>
          {variant === 'public' ? (
            <nav aria-label="Main navigation" className="flex min-w-0 items-center justify-end gap-0.5 text-xs font-medium sm:gap-2 sm:text-sm">
              {signedIn && <>
                <Link href="/how-it-works" className={`hidden rounded-full px-3 py-2 transition-colors hover:bg-sunshine-light lg:inline-flex ${pathname === '/how-it-works' ? 'bg-sunshine-light font-semibold' : 'text-midnight'}`}>
                  How it works
                </Link>
                <Link href="/opportunities" className={`hidden rounded-full px-3 py-2 transition-colors hover:bg-sunshine-light sm:inline-flex ${pathname === '/opportunities' ? 'bg-sunshine-light font-semibold' : 'text-midnight'}`}>
                  Opportunities
                </Link>
                <Link href="/partners" className={`hidden rounded-full px-3 py-2 transition-colors hover:bg-sunshine-light lg:inline-flex ${pathname === '/partners' ? 'bg-sunshine-light font-semibold' : 'text-midnight'}`}>
                  For organizations
                </Link>
                <Link href="/about" className={`hidden rounded-full px-3 py-2 transition-colors hover:bg-sunshine-light lg:inline-flex ${pathname === '/about' ? 'bg-sunshine-light font-semibold' : 'text-midnight'}`}>
                  About
                </Link>
              </>}
              <AccountMenu compact onUserChange={setSignedIn} />
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm font-medium text-midnight sm:inline">Learner workspace</span>
              <AccountMenu compact />
            </div>
          )}
        </div>
      </header>
      {variant === 'workspace' && <WorkspaceNav />}
      {!(variant === 'public' && pathname === '/') && (
        <section
          aria-label={`${bannerLabel} banner`}
          className="relative isolate h-36 overflow-hidden border-y border-[#e5e5e5] bg-white sm:h-44 lg:h-52"
        >
          <img
            src={bannerImage}
            alt=""
            aria-hidden="true"
            width={612}
            height={245}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-black/45" />
          <div className="pointer-events-none absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-full">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-sunshine drop-shadow sm:text-xs">CareerForge</p>
                <h2 className="mt-1 whitespace-nowrap text-lg font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-2xl lg:text-3xl">
                  {bannerLabel}
                </h2>
              </div>
            </div>
          </div>
        </section>
      )}
      <main id="main-content" className="bg-white">{children}</main>
      <footer className={`border-t-4 border-sunshine bg-white text-midnight ${variant === 'workspace' ? 'pb-20 md:pb-0' : ''}`}>
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-10 sm:px-6 sm:pb-7 sm:pt-12 lg:px-8">
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr] lg:gap-14">
            <div className="max-w-sm">
              <Link href="/" className="inline-flex items-center gap-3 rounded-sm font-bold text-midnight" aria-label="CareerForge home">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-sunshine text-midnight ring-4 ring-sunshine-light">
                  <BriefcaseBusiness size={19} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="text-lg">CareerForge</span>
              </Link>
              <p className="mt-4 text-sm leading-6 text-midnight">
                A practical starting point for work readiness, money confidence, and your next steps.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] px-3 py-1 text-xs font-medium text-midnight">
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
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#e5e5e5] px-4 text-sm font-semibold text-midnight"
                  >
                    <LinkedInMark />
                    LinkedIn
                    <span className="text-xs font-normal text-midnight">Coming soon</span>
                  </span>
                )}
              </div>
            </div>

            <nav aria-label="Explore CareerForge">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-midnight">Explore</h2>
              <ul className="mt-4 space-y-3 text-sm text-midnight">
                <li><Link href="/how-it-works" className="transition-colors hover:bg-sunshine-light">How it works</Link></li>
                <li><Link href="/opportunities" className="transition-colors hover:bg-sunshine-light">Opportunities</Link></li>
                <li><Link href="/partners" className="transition-colors hover:bg-sunshine-light">For organizations</Link></li>
                <li><Link href="/about" className="transition-colors hover:bg-sunshine-light">About CareerForge</Link></li>
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

          <div className="mt-9 flex flex-col gap-3 border-t border-[#e5e5e5] pt-5 text-xs leading-5 text-midnight sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
            <p>Opportunities open on the original provider’s site. You choose what to share and when to apply.</p>
            <p className="shrink-0">© CareerForge</p>
          </div>
        </div>
      </footer>
    </>
  );
}
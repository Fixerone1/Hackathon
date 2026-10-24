'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';

const destinations = [
  { title: 'Study and career pathways', description: 'Explore how to plan your next step towards further study or work.', href: '/how-it-works', keywords: 'study education qualification college university career pathways' },
  { title: 'Verified opportunities', description: 'Learn how CareerForge shares checked opportunities with learners.', href: '/opportunities', keywords: 'jobs work employment vacancies opportunities' },
  { title: 'CV Builder', description: 'Find the CV tool in your learner workspace.', href: '/app/employment/cv', keywords: 'cv resume experience skills work history builder' },
  { title: 'Interview Coach', description: 'Prepare for your next interview in the learner workspace.', href: '/app/employment/interview', keywords: 'interview questions confidence coach prepare' },
  { title: 'Skills Assessment', description: 'Explore your strengths and identify areas to grow.', href: '/app/employment/assessment', keywords: 'assessment strengths skills test' },
  { title: 'Skills Academy', description: 'Find practical learning activities in the learner workspace.', href: '/app/employment/academy', keywords: 'learn course training academy skills' },
  { title: 'Money Skills', description: 'Build money confidence and plan everyday financial goals.', href: '/app/money', keywords: 'money finance budget savings financial pay salary' },
  { title: 'Growth Studio', description: 'Take a first step with a business idea or side project.', href: '/app/growth', keywords: 'business entrepreneur idea startup enterprise' },
  { title: 'About CareerForge', description: 'Learn about our approach to youth economic mobility.', href: '/about', keywords: 'about purpose privacy south africa' },
  { title: 'Create an account', description: 'Join CareerForge and start building your learner profile.', href: '/signup', keywords: 'signup join account register start' },
];

export function SiteSearch() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];
    return destinations.filter((item) => {
      const searchable = `${item.title} ${item.description} ${item.keywords}`.toLocaleLowerCase();
      return terms.every((term) => searchable.includes(term));
    }).slice(0, 5);
  }, [query]);

  return (
    <section aria-labelledby="site-search-heading" className="relative z-10 mx-auto -mt-7 w-[calc(100%-2rem)] max-w-4xl rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-[0_12px_36px_rgba(34,34,34,0.12)] sm:-mt-8 sm:p-5">
      <label id="site-search-heading" htmlFor="site-search" className="mb-2 block text-sm font-bold text-midnight">
        What are you looking for?
      </label>
      <div className="flex min-h-12 items-center gap-3 rounded-xl border border-[#d9d9d9] bg-white px-3 focus-within:border-sunshine-dark focus-within:ring-2 focus-within:ring-sunshine/50">
        <Search size={19} className="shrink-0 text-midnight" aria-hidden="true" />
        <input
          id="site-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search study, jobs, CVs, money skills..."
          className="min-w-0 flex-1 border-0 bg-transparent py-2 text-base text-midnight placeholder:text-slate-500 focus:outline-none"
          aria-controls="site-search-results"
          aria-describedby="site-search-help"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-midnight hover:bg-sunshine-light">
            <X size={17} aria-hidden="true" />
          </button>
        )}
      </div>
      <p id="site-search-help" className="mt-2 text-xs text-midnight">Search tools, opportunities, money guidance, study pathways, and more.</p>
      {query.trim() && (
        <div id="site-search-results" className="mt-3" role="region" aria-label="Search results">
          {results.length > 0 ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {results.map((result) => (
                <li key={result.href}>
                  <Link href={result.href} className="flex h-full items-center justify-between gap-3 rounded-xl border border-[#e5e5e5] px-3 py-3 text-left transition hover:border-sunshine-dark hover:bg-sunshine-light">
                    <span>
                      <span className="block text-sm font-semibold text-midnight">{result.title}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-midnight">{result.description}</span>
                    </span>
                    <ArrowRight size={16} className="shrink-0 text-midnight" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-[#e5e5e5] bg-white px-3 py-3 text-sm text-midnight" role="status">
              No matches yet. Try “study”, “CV”, “jobs”, “money”, or “business”.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

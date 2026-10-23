import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicShell } from '@/components/PublicShell';

export default function PublicOpportunitiesPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <p className="eyebrow">Opportunities</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold text-midnight sm:text-4xl">Find opportunities that fit what you can do today.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">Public listings will appear here once approved source connectors are configured. Every listing must link to its original advert and show its source and closing date.</p>
        <div className="mt-8 border-y border-slate-200 py-6">
          <p className="font-semibold text-midnight">No verified opportunities are available in this preview.</p>
          <p className="mt-2 text-sm text-slate-600">We will not show sample jobs as real openings.</p>
        </div>
        <Link href="/signup" className="btn-primary mt-6">Sign up to see personal matches <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>
    </PublicShell>
  );
}

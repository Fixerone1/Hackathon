import Link from 'next/link';
import { PublicShell } from '@/components/PublicShell';

export default function PartnersPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <p className="eyebrow">For organizations</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold text-midnight sm:text-4xl">Support a more practical transition into work.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">CareerForge is designed for employers, funders, education providers, and youth-development partners who want to help young people understand their next steps.</p>
        <div className="mt-8 border-y border-slate-200 py-6">
          <h2 className="font-semibold text-midnight">Partner features are not active in this preview</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Organization accounts, verified posting forms, and aggregate reporting have not been implemented. No partner outcomes or impact statistics are claimed.</p>
        </div>
        <Link href="/how-it-works" className="link mt-6 inline-flex">Review the learner journey</Link>
      </section>
    </PublicShell>
  );
}

import Link from 'next/link';
import { PublicShell } from '@/components/PublicShell';
import { PageIntro } from '@/components/PageIntro';

export default function PartnersPage() {
  return (
    <PublicShell>
      <section className="page-section">
        <PageIntro
          eyebrow="For organizations"
          title="Support a more practical transition into work."
          description="Ukukhanya is designed for employers, funders, education providers, and youth-development partners who want to help young people understand their next steps."
          className="max-w-4xl"
        />
        <div className="rounded-2xl border border-[#e5e5e5] border-l-4 border-l-sunshine bg-[#f7f7f7] p-5 sm:p-7">
          <h2 className="text-lg font-bold text-midnight">Partner features are not active in this preview</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#555555]">Organization accounts, verified posting forms, and aggregate reporting have not been implemented. No partner outcomes or impact statistics are claimed.</p>
          <Link href="/how-it-works" className="link mt-5 inline-flex">Review the learner journey</Link>
        </div>
      </section>
    </PublicShell>
  );
}

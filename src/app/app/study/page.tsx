import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { OpportunityFeed } from '@/components/OpportunityFeed';
import { PageIntro } from '@/components/PageIntro';
import { StudyNav } from '@/components/StudyNav';
import { StudyProfileSummary } from '@/components/StudyProfileSummary';
import { PublishedSiteContent } from '@/components/PublishedSiteContent';
import { StudyAdmissions } from '@/components/StudyAdmissions';
import { SaveItemButton } from '@/components/SaveItemButton';
import { studyNavigation } from '@/lib/navigation';

export const metadata = { title: 'Study and bursaries' };

export default function StudyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro
        eyebrow="Study Hub"
        title="Plan your next step in education"
        description="Find bursary listings, explore study pathways, and keep your education details together as you plan."
      />
      <StudyNav />

      <StudyAdmissions />

      <StudyProfileSummary />

      <section className="mb-8" aria-labelledby="study-tools-heading">
        <div className="mb-4">
          <p className="eyebrow">Your study tools</p>
          <h2 id="study-tools-heading" className="mt-1 text-xl font-bold text-midnight">Explore funding and learning</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Compare options, check current requirements, and confirm all deadlines with the official provider.</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {studyNavigation.map(({ href, label, Icon, text, tag }) => (
            <li key={label} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-400 hover:shadow-card sm:p-5">
              <Link href={href} className="group flex min-h-32 flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold tracking-[0.12em] text-slate-600">{tag}</span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sunshine-light text-midnight">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold text-midnight">{label}</h3>
                <p className="mt-1 flex-1 text-sm leading-5 text-slate-600">{text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-midnight group-hover:underline">
                  Open <ArrowRight size={14} aria-hidden="true" />
                </span>
              </Link>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <SaveItemButton itemType="tool" itemId={href} title={label} link={href} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="bursaries" className="scroll-mt-36" aria-labelledby="study-bursaries-heading">
        <div className="mb-4">
          <p className="eyebrow">Funding for your studies</p>
          <h2 id="study-bursaries-heading" className="mt-1 text-xl font-bold text-midnight">Bursaries and scholarships</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Listings shown here are verified opportunities. Always confirm eligibility, application dates, and required documents with the funder.</p>
        </div>
        <OpportunityFeed categoryFilter="bursary" />
      </section>

      <PublishedSiteContent
        contentType="opportunity_resource"
        heading="Study events and useful information"
        eyebrow="More ways to learn"
        emptyMessage="There are no study events or information updates right now. Check back for new content."
      />

      <p className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        Bursary dates and eligibility can change. Verify details with the funder or institution and submit applications only through its official channel. <Link href="/app/profile" className="font-semibold text-midnight underline underline-offset-2">Update your saved education details</Link>.
      </p>
    </div>
  );
}

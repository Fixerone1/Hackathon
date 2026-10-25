import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, ClipboardCheck, UserRound } from 'lucide-react';
import { EmploymentNav } from '@/components/EmploymentNav';
import { PageIntro } from '@/components/PageIntro';
import { PublishedSiteContent } from '@/components/PublishedSiteContent';

const nextSteps = [
  {
    number: '01',
    title: 'Update your profile',
    description: 'Add your qualification, skills, location, and role interests. These details help explain how listings compare with your profile.',
    href: '/app/profile',
    action: 'Update profile',
    Icon: UserRound,
    featured: true,
  },
  {
    number: '02',
    title: 'Find an opportunity',
    description: 'Explore current verified listings and review their requirements and closing dates.',
    href: '/app/employment/opportunities',
    action: 'Browse opportunities',
    Icon: BriefcaseBusiness,
    featured: false,
  },
  {
    number: '03',
    title: 'Keep track',
    description: 'See the listings you saved and the opportunities you marked as applied.',
    href: '/app/employment/applications',
    action: 'View my opportunities',
    Icon: ClipboardCheck,
    featured: false,
  },
];

export default function EmploymentPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro
        eyebrow="Employment Hub"
        title="Build your work readiness"
        description="Take one step at a time: prepare your profile, explore verified opportunities, and keep track of applications."
        className="mb-6"
      />
      <EmploymentNav />

      <section aria-labelledby="next-steps-heading">
        <div className="mb-5">
          <p className="eyebrow">Your starting point</p>
          <h2 id="next-steps-heading" className="section-heading mt-2">Your next steps</h2>
          <p className="section-description">Choose what you need today. You can come back and continue whenever you’re ready.</p>
        </div>

        <ol className="grid gap-4 lg:grid-cols-3">
          {nextSteps.map(({ number, title, description, href, action, Icon, featured }) => (
            <li key={href}>
              <Link
                href={href}
                className={`group flex h-full flex-col rounded-2xl border p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunshine-dark focus-visible:ring-offset-2 sm:p-6 ${
                  featured ? 'border-sunshine-dark/50 bg-surface' : 'border-[#FFF8B8] bg-surface'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="metadata-label">Step {number}</span>
                  <span className={`grid h-10 w-10 place-items-center rounded-full ${featured ? 'bg-sunshine text-midnight' : 'bg-white text-midnight'}`}>
                    <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-midnight">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-midnight">
                  {action}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
        You stay in control: applications open on the original provider’s site, and you submit them yourself.
      </p>
      <PublishedSiteContent
        contentType={['learning_resource', 'employment_resource']}
        heading="Learning and employment resources"
        eyebrow="Explore more"
      />
    </div>
  );
}

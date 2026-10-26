import { EmploymentNav } from '@/components/EmploymentNav';
import { OpportunityHub } from '@/components/OpportunityHub';
import { PageIntro } from '@/components/PageIntro';

export default function OpportunitiesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro
        eyebrow="Employment Hub"
        title="Opportunity matches"
        description="Find verified jobs, bursaries, and funding applications, or browse seminars and useful information in a separate feed."
        className="mb-5"
      />
      <EmploymentNav />
      <OpportunityHub />
    </div>
  );
}

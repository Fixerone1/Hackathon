import { EmploymentNav } from '@/components/EmploymentNav';
import { OpportunityFeed } from '@/components/OpportunityFeed';
import { PageIntro } from '@/components/PageIntro';

export default function ApplicationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro
        eyebrow="Employment Hub"
        title="My opportunities"
        description="Keep track of listings you saved and opportunities you marked as applied for."
        className="mb-6"
      />
      <EmploymentNav />
      <OpportunityFeed mode="applications" />
    </div>
  );
}

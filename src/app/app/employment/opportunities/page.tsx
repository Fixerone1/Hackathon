import { EmploymentNav } from '@/components/EmploymentNav';
import { OpportunityFeed } from '@/components/OpportunityFeed';
import { PageIntro } from '@/components/PageIntro';

export default function OpportunitiesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro
        eyebrow="Employment Hub"
        title="Opportunity matches"
        description="Review verified opportunities, see how stated requirements compare with your profile, and apply on the original source site."
        className="mb-5"
      />
      <p className="mb-5 mt-0 text-sm leading-6 text-[#555555]">Start with the closing date and fit signals. Open a listing to see application preparation options.</p>
      <EmploymentNav />
      <OpportunityFeed />
    </div>
  );
}

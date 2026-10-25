import { PhaseOneStatus } from '@/components/PhaseOneStatus';
import { PageIntro } from '@/components/PageIntro';
import { PublishedSiteContent } from '@/components/PublishedSiteContent';

export default function MoneySkillsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro eyebrow="Money Skills" title="Build money confidence" description="Practice practical money decisions and plan for your next step." />
      <div className="grid gap-5 md:grid-cols-2">
        <PhaseOneStatus title="Salary planner">The salary planner implementation was not included in the uploaded source. It is not currently calculating take-home pay.</PhaseOneStatus>
        <PhaseOneStatus title="Savings goals">Goal tracking and lesson content are not connected in this Phase 1 build.</PhaseOneStatus>
      </div>
      <PublishedSiteContent contentType="money_skill" heading="Money Skills resources" eyebrow="Learn at your own pace" />
    </div>
  );
}

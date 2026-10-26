import { PageIntro } from '@/components/PageIntro';
import { MoneySkills } from '@/components/MoneySkills';
import { PublishedSiteContent } from '@/components/PublishedSiteContent';

export default function MoneySkillsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro eyebrow="Money Skills" title="Build money confidence" description="Practice practical money decisions and plan for your next step." />
      <MoneySkills />
      <PublishedSiteContent
        contentType="money_skill"
        heading="Money tips and resources"
        eyebrow="More money guidance"
      />
    </div>
  );
}

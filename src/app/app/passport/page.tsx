import { PageIntro } from '@/components/PageIntro';
import { SkillsPassportBuilder } from '@/components/SkillsPassportBuilder';

export const metadata = { title: 'Skills Passport' };

export default function SkillsPassportPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro
        eyebrow="Your work profile"
        title="Skills Passport"
        description="Build a shareable portfolio with real examples, then choose exactly what an employer can see."
      />
      <SkillsPassportBuilder />
    </div>
  );
}
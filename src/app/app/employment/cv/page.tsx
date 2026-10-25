import { CvBuilder } from '@/components/CvBuilder';
import { EmploymentNav } from '@/components/EmploymentNav';
import { PageIntro } from '@/components/PageIntro';

export default function CvPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro
        eyebrow="Employment Hub"
        title="CV builder"
        description="Build a job-focused CV from your profile, complete a guided question bank, review it, and export an editable Word document, text, or print-ready PDF."
      />
      <EmploymentNav />
      <CvBuilder />
    </div>
  );
}

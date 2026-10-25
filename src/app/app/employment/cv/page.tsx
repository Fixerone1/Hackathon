import { CvBuilder } from '@/components/CvBuilder';
import { EmploymentNav } from '@/components/EmploymentNav';
import { PageIntro } from '@/components/PageIntro';

export default function CvPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro
        eyebrow="Employment Hub"
        title="CV builder"
        description="Build a clear CV from your profile, add your experience, then save or print it as a PDF."
      />
      <EmploymentNav />
      <CvBuilder />
    </div>
  );
}

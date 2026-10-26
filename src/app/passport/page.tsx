import { Suspense } from 'react';
import { PublicSkillsPassport } from '@/components/PublicSkillsPassport';

export const metadata = {
  title: 'Skills Passport',
  robots: { index: false, follow: false },
};

export default function PassportPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-center text-sm text-slate-600" role="status">Loading Skills Passport...</p>}>
      <PublicSkillsPassport />
    </Suspense>
  );
}
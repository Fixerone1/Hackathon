import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MySpace } from '@/components/MySpace';
import { PageIntro } from '@/components/PageIntro';

export const metadata = { title: 'My Space' };

export default function MySpacePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 md:py-10 lg:px-8">
      <Link href="/app" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-midnight underline underline-offset-2">
        <ArrowLeft size={16} aria-hidden="true" /> Dashboard
      </Link>
      <PageIntro eyebrow="Dashboard" title="My Space" description="Your saved things, next steps, application tracker, and unfinished drafts—all together." />
      <MySpace />
    </div>
  );
}

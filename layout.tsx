import type { ReactNode } from 'react';
import { GROWTH_TABS, SectionTabs } from '@/components/SectionTabs';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <SectionTabs items={GROWTH_TABS} />
      {children}
    </>
  );
}

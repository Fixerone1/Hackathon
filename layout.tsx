import type { ReactNode } from 'react';
import { MONEY_TABS, SectionTabs } from '@/components/SectionTabs';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <SectionTabs items={MONEY_TABS} />
      {children}
    </>
  );
}

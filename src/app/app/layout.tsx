import type { ReactNode } from 'react';
import { PublicShell } from '@/components/PublicShell';
import { MONEY_TABS, SectionTabs } from '@/components/SectionTabs';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <PublicShell variant="workspace">
      <SectionTabs items={MONEY_TABS} />
      {children}
    </PublicShell>
  );
}

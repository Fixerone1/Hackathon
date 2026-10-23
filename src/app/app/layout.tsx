import type { ReactNode } from 'react';
import { PublicShell } from '@/components/PublicShell';
import { WorkspaceNav } from '@/components/WorkspaceNav';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <PublicShell variant="workspace">
      <WorkspaceNav />
      <div className="pb-16 md:pb-0">{children}</div>
    </PublicShell>
  );
}

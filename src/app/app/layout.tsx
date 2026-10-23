import type { ReactNode } from 'react';
import { PublicShell } from '@/components/PublicShell';
import { WorkspaceGuard } from '@/components/WorkspaceGuard';
import { WorkspaceNav } from '@/components/WorkspaceNav';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceGuard>
      <PublicShell variant="workspace">
        <WorkspaceNav />
        <div className="pb-16 md:pb-0">{children}</div>
      </PublicShell>
    </WorkspaceGuard>
  );
}

import type { ReactNode } from 'react';
import { PublicShell } from '@/components/PublicShell';
import { WorkspaceGuard } from '@/components/WorkspaceGuard';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceGuard>
      <PublicShell variant="workspace">
        <div className="pb-20 md:pb-0">{children}</div>
      </PublicShell>
    </WorkspaceGuard>
  );
}

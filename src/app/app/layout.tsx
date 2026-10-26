import type { ReactNode } from 'react';
import { PublicShell } from '@/components/PublicShell';
import { WorkspaceGuard } from '@/components/WorkspaceGuard';
import { ForgeProvider } from '@/components/ForgeContext';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <PublicShell variant="workspace">
      <WorkspaceGuard>
        <ForgeProvider>{children}</ForgeProvider>
      </WorkspaceGuard>
    </PublicShell>
  );
}

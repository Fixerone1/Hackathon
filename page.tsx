import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PublicShell } from '@/components/PublicShell';
import { AuthForm } from '@/components/AuthForm';

export const metadata: Metadata = { title: 'Create your free account' };

export default function SignupPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="text-3xl font-bold text-midnight">Create your free account</h1>
        <p className="mb-6 mt-1 text-slate-600">Start building your Economic Mobility Score today.</p>
        <div className="card">
          <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
            <AuthForm mode="signup" />
          </Suspense>
        </div>
      </div>
    </PublicShell>
  );
}

import type { Metadata } from 'next';
import { AuthForm } from '@/components/AuthForm';
import { PublicShell } from '@/components/PublicShell';

export const metadata: Metadata = { title: 'Create your free account' };

export default function SignupPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-bold text-midnight">Create your free account</h1>
          <p className="mb-6 mt-2 text-slate-600">Start building your Economic Mobility Score today.</p>
          <div className="card">
            <AuthForm mode="signup" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
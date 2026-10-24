import type { Metadata } from 'next';
import { AuthForm } from '@/components/AuthForm';
import { PublicShell } from '@/components/PublicShell';

export const metadata: Metadata = { title: 'Create your free account' };

export default function SignupPage() {
  return (
    <PublicShell>
      <section className="mx-auto grid min-h-[65svh] max-w-6xl place-items-center px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="w-full max-w-md">
          <p className="eyebrow">Get started</p>
          <h1 className="page-title mt-1">Create your account</h1>
          <p className="page-description mb-6">Start building your Economic Mobility Score today.</p>
          <div className="card p-5 sm:p-7">
            <AuthForm mode="signup" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
import type { Metadata } from 'next';
import { AuthForm } from '@/components/AuthForm';
import { PublicShell } from '@/components/PublicShell';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <PublicShell>
      <section className="mx-auto grid min-h-[65svh] max-w-6xl place-items-center px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="w-full max-w-md">
          <p className="eyebrow">Learner workspace</p>
          <h1 className="page-title mt-1">Welcome back</h1>
          <p className="page-description mb-6">Sign in to continue to your CareerForge workspace.</p>
          <div className="card p-5 sm:p-7">
            <AuthForm mode="login" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
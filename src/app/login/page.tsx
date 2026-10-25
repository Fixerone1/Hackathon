import type { Metadata } from 'next';
import { AuthForm } from '@/components/AuthForm';
import { PublicShell } from '@/components/PublicShell';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <PublicShell>
      <section className="mx-auto grid min-h-[65svh] max-w-6xl place-items-center px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="auth-panel">
          <p className="eyebrow">Learner workspace</p>
          <h1 className="page-title mt-2">Welcome back</h1>
          <p className="page-description mb-6">Sign in to continue to your CareerForge workspace.</p>
          <div className="border-t border-[#e5e5e5] pt-5">
            <AuthForm mode="login" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
import type { Metadata } from 'next';
import { AuthForm } from '@/components/AuthForm';
import { PublicShell } from '@/components/PublicShell';

export const metadata: Metadata = { title: 'Create your free account' };

export default function SignupPage() {
  return (
    <PublicShell>
      <section className="mx-auto grid min-h-[65svh] max-w-6xl place-items-center px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="auth-panel">
          <p className="eyebrow">Get started</p>
          <h1 className="page-title mt-2">Create your account</h1>
          <p className="page-description mb-6">Start building your Economic Mobility Score today.</p>
          <div className="border-t border-[#FFF8B8] pt-5">
            <AuthForm mode="signup" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
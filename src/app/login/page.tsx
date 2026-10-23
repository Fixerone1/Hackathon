import type { Metadata } from 'next';
import { AuthForm } from '@/components/AuthForm';
import { PublicShell } from '@/components/PublicShell';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-bold text-midnight">Welcome back</h1>
          <p className="mb-6 mt-2 text-slate-600">Sign in to continue to your CareerForge workspace.</p>
          <div className="card">
            <AuthForm mode="login" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
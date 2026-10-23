'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function AuthForm({ mode }: { mode: 'signup' | 'login' }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isSignup = mode === 'signup';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const body = {
      ...(isSignup ? { name: String(form.get('name') || '') } : {}),
      ...(isSignup ? { privacy_consent: form.get('privacy_consent') === 'on' } : {}),
      email: String(form.get('email') || ''),
      password: String(form.get('password') || ''),
    };

    try {
      const response = await fetch(`/auth-api/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body),
      });
      const result = await response.json() as { detail?: string; confirmation_required?: boolean };
      if (!response.ok) {
        setError(result.detail || 'We could not sign you in. Please try again.');
        return;
      }
      if (result.confirmation_required) {
        setNotice('Check your email for a confirmation link, then return here to sign in.');
        return;
      }
      router.replace(isSignup ? '/app/profile' : '/app');
      router.refresh();
    } catch {
      setError('Authentication service is unavailable. Please try again shortly.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignup && (
        <div>
          <label htmlFor="full-name" className="label">Full name</label>
          <input id="full-name" name="name" autoComplete="name" minLength={2} maxLength={100} required className="input" />
        </div>
      )}
      <div>
        <label htmlFor="email" className="label">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" autoCapitalize="none" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          minLength={isSignup ? 12 : 1}
          maxLength={128}
          required
          className="input"
        />
      </div>
      {isSignup && (
        <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
          <input name="privacy_consent" type="checkbox" required className="mt-1 h-4 w-4 accent-emerald" />
          <span>I agree to the <Link href="/privacy" className="link">privacy notice</Link> and understand my profile information will be stored to provide this service.</span>
        </label>
      )}
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
      </button>
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-emerald/30 bg-emerald-light p-3 text-sm text-midnight">{notice}</p>}
      <p className="text-center text-sm text-slate-600">
        {isSignup ? 'Already have an account?' : 'New to CareerForge?'}{' '}
        <Link href={isSignup ? '/login' : '/signup'} className="link">
          {isSignup ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </form>
  );
}
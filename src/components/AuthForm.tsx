'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';

export function AuthForm({ mode }: { mode: 'signup' | 'login' }) {
  const [submitted, setSubmitted] = useState(false);
  const isSignup = mode === 'signup';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignup && (
        <div>
          <label htmlFor="full-name" className="label">Full name</label>
          <input id="full-name" name="name" autoComplete="name" required className="input" />
        </div>
      )}
      <div>
        <label htmlFor="email" className="label">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          minLength={8}
          required
          className="input"
        />
      </div>
      <button type="submit" className="btn-primary w-full">
        {isSignup ? 'Create demo account' : 'Sign in'}
      </button>
      {submitted && (
        <p role="status" className="rounded-lg border border-emerald/30 bg-emerald-light p-3 text-sm text-midnight">
          Account access is not connected in this preview. You can try the dashboard without signing in.
        </p>
      )}
      <p className="text-center text-sm text-slate-600">
        <Link href="/app" className="link">Open the demo dashboard</Link>
      </p>
    </form>
  );
}
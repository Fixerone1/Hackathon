import Link from 'next/link';
import { PublicShell } from '@/components/PublicShell';

export default function NotFound() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-sm font-semibold text-emerald-dark">404</p>
        <h1 className="mt-2 text-3xl font-bold text-midnight">We could not find that page</h1>
        <p className="mt-3 text-slate-600">The page may have moved. Try one of these instead:</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn-primary">Home</Link>
          <Link href="/opportunities" className="btn-secondary">Opportunities</Link>
          <Link href="/app" className="btn-secondary">My dashboard</Link>
        </div>
      </section>
    </PublicShell>
  );
}

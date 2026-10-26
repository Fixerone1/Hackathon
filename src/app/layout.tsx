import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import './globals.css';
import { PageAccessGuard } from '@/components/PageAccessGuard';

const browserStorageMigration = `(() => {
  const prefixes = /^(careerforge|ukukhanya)-/i;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      for (let index = storage.length - 1; index >= 0; index -= 1) {
        const oldKey = storage.key(index);
        if (!oldKey || !prefixes.test(oldKey)) continue;
        const newKey = 'beacon:' + oldKey.replace(prefixes, '');
        const oldValue = storage.getItem(oldKey);
        const currentValue = storage.getItem(newKey);
        if (currentValue === null && oldValue !== null) storage.setItem(newKey, oldValue);
        if (storage.getItem(newKey) === oldValue) storage.removeItem(oldKey);
      }
    } catch (error) {
      console.error('Beacon could not migrate saved browser data:', error);
    }
  }
})();`;

export const metadata: Metadata = {
  title: {
    default: 'Beacon',
    template: '%s | Beacon',
  },
  description: 'Build career readiness, money confidence, and a plan for your next opportunity.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: 'Beacon',
    title: 'Beacon | Light your way forward',
    description: 'Build career readiness, money confidence, and a plan for your next opportunity.',
    locale: 'en_ZA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beacon | Light your way forward',
    description: 'Build career readiness, money confidence, and a plan for your next opportunity.',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-ZA">
      <body className="min-h-screen">
        <Script id="beacon-browser-storage-migration" strategy="beforeInteractive">{browserStorageMigration}</Script>
        <PageAccessGuard>{children}</PageAccessGuard>
      </body>
    </html>
  );
}
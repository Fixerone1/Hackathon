import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import './globals.css';
import { PageAccessGuard } from '@/components/PageAccessGuard';

export const metadata: Metadata = {
  title: {
    default: 'CareerForge AI',
    template: '%s | CareerForge AI',
  },
  description: 'Build career readiness, money confidence, and a plan for your next opportunity.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-ZA">
      <body className="min-h-screen"><PageAccessGuard>{children}</PageAccessGuard></body>
    </html>
  );
}
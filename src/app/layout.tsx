import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

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
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
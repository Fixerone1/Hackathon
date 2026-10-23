import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return ['', '/how-it-works', '/opportunities', '/partners', '/about', '/login', '/signup'].map((p) => ({
    url: base + p,
    lastModified: new Date(),
  }));
}

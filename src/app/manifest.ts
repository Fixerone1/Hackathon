import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return {
    name: 'Beacon',
    short_name: 'Beacon',
    description: 'Light your way forward.',
    start_url: `${basePath}/app`,
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#FFC400',
    icons: [
      {
        src: `${basePath}/logo.webp`,
        sizes: '192x192',
        type: 'image/webp',
      },
    ],
  };
}

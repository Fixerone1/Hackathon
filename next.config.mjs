/** @type {import('next').NextConfig} */

const isStatic = process.env.GITHUB_PAGES === 'true' || process.env.STATIC_EXPORT === 'true';
const basePath = isStatic ? process.env.NEXT_PUBLIC_BASE_PATH || '' : '';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(isStatic
    ? { output: 'export', basePath, assetPrefix: basePath || undefined, trailingSlash: true, images: { unoptimized: true } }
    : {
        async headers() {
          return [{ source: '/:path*', headers: securityHeaders }];
        },
      }),
};

export default nextConfig;

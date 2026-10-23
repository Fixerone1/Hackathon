/** @type {import('next').NextConfig} */

// GitHub Pages mode: set STATIC_EXPORT=true (the deploy workflow does this).
// It builds plain static files into /out. Pages can't run server code, so the optional
// /api/ai route is left out and the app uses its built-in local coaching instead.
const isStatic = process.env.STATIC_EXPORT === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''; // e.g. "/careerforge" for username.github.io/careerforge
const authServiceUrl = (process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

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
  ...(isStatic
    ? { output: 'export', basePath, assetPrefix: basePath || undefined, trailingSlash: true, images: { unoptimized: true } }
    : {
        async rewrites() {
          return [
            {
              source: '/auth-api/:path*',
              destination: `${authServiceUrl}/auth-api/:path*`,
            },
          ];
        },
        async headers() {
          return [{ source: '/:path*', headers: securityHeaders }];
        },
      }),
};

export default nextConfig;

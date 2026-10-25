export function normalizePathname(pathname: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const withoutBasePath = basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))
    ? pathname.slice(basePath.length) || '/'
    : pathname;

  return withoutBasePath.replace(/\/+$/, '') || '/';
}

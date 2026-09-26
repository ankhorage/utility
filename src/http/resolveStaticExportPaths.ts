import path from 'node:path';

/*** Resolve a static-export URL path to direct, HTML, and directory-index file candidates. */
export function resolveStaticExportPaths(pathname: string): string[] {
  if (pathname === '/') return ['index.html'];
  const decoded = decodeURIComponent(pathname).replace(/^\/+|\/+$/gu, '');
  if (path.extname(decoded)) return [decoded];
  return [`${decoded}.html`, path.join(decoded, 'index.html')];
}

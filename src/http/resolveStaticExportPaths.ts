/*** Resolve a static-export URL path to direct, HTML, and directory-index file candidates. */
export function resolveStaticExportPaths(pathname: string): string[] {
  if (pathname === '/') return ['index.html'];

  const decoded = decodeURIComponent(pathname).replace(/^\/+|\/+$/gu, '');
  const fileName = decoded.split('/').at(-1) ?? '';
  const hasExtension = fileName !== '..' && fileName.lastIndexOf('.') > 0;

  if (hasExtension) return [decoded];

  return [`${decoded}.html`, `${decoded}/index.html`];
}

/***
 * Sanitize an arbitrary path segment to letters, digits, underscores, and hyphens with a fallback.
 */
export function sanitizePathSegment(value: string, fallback = 'media'): string {
  const normalized = value
    .trim()
    .replace(/[^A-Za-z0-9_-]+/gu, '-')
    .replace(/^-+|-+$/gu, '');
  return normalized || fallback;
}

/***
 * Sanitize a possibly path-qualified filename while preserving safe dots, underscores, and hyphens.
 */
export function sanitizeFileName(value: string, fallback = 'asset'): string {
  const baseName = value.trim().split(/[\\/]/u).at(-1) ?? '';
  const normalized = baseName.replace(/[^A-Za-z0-9._-]+/gu, '-').replace(/^\.+/u, '');
  return normalized || fallback;
}

/***
 * Validate a filename extension and optional MIME type against caller-provided allowlists.
 */
export function matchesFileType(args: {
  readonly fileName: string;
  readonly extensions: readonly string[];
  readonly contentType?: string;
  readonly contentTypes?: readonly string[];
}): boolean {
  const lowerName = args.fileName.toLocaleLowerCase();
  const extensionMatches = args.extensions.some((extension) => {
    const normalized = extension.startsWith('.') ? extension.toLocaleLowerCase() : `.${extension.toLocaleLowerCase()}`;
    return lowerName.endsWith(normalized);
  });
  if (!extensionMatches) return false;
  if (args.contentType === undefined) return true;
  return args.contentTypes?.includes(args.contentType) === true;
}

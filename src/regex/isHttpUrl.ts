export function isHttpUrl(value: string): boolean {
  const normalized = value.trim();
  if (normalized.length === 0 || /\s/u.test(normalized)) return false;

  try {
    const url = new URL(normalized);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.length > 0;
  } catch {
    return false;
  }
}

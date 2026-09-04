import type { OpenUrl } from './types.js';

/*** Open a URL in a new browser tab without opener access when an opener implementation is available. */
export function openUrl(url: string, opener: OpenUrl | undefined): boolean {
  if (!opener) return false;
  opener(url, '_blank', 'noopener,noreferrer');
  return true;
}

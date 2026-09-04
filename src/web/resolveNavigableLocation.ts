import type { BrowserLocationLike } from './types.js';

/*** Preserve search and hash suffixes when a requested pathname matches the current browser pathname. */
export function resolveNavigableLocation(
  pathname: string,
  location: BrowserLocationLike | undefined,
): string {
  return location?.pathname === pathname
    ? `${pathname}${location.search}${location.hash}`
    : pathname;
}

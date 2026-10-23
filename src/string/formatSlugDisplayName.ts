/*** Format a hyphen-separated slug as a display name with each word's initial capitalized. */
export function formatSlugDisplayName(slug: string): string {
  return slug
    .split('-')
    .filter((segment) => segment.length > 0)
    .map((segment) => `${segment[0]?.toUpperCase() ?? ''}${segment.slice(1)}`)
    .join(' ');
}

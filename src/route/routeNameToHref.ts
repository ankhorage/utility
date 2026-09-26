/*** Convert a file route name into its public href, treating index as the root. */
export function routeNameToHref(routeName: string): string {
  const normalized = routeName.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  if (!normalized || normalized === 'index') return '/';
  return `/${normalized}`;
}

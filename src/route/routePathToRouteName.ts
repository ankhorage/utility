/*** Normalize an application path to a file route name, using index at the root. */
export function routePathToRouteName(routePath: string): string {
  const normalized = routePath.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  return normalized === '' ? 'index' : normalized;
}

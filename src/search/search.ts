/***
 * Score an already-normalized target by exact, prefix, or substring match quality.
 */
export function scoreTextMatch(target: string, query: string): number {
  if (query.length === 0) return 0;
  if (target === query) return 100;
  if (target.startsWith(query)) return 50;
  return target.includes(query) ? 25 : 0;
}

/***
 * Return the highest text-match score across a set of already-normalized candidate strings.
 */
export function scoreBestTextMatch(candidates: readonly string[], query: string): number {
  return candidates.reduce((score, candidate) => Math.max(score, scoreTextMatch(candidate, query)), 0);
}

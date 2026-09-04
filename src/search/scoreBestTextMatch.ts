import { scoreTextMatch } from './scoreTextMatch.js';

/*** Return the highest text-match score across a set of already-normalized candidate strings. */
export function scoreBestTextMatch(candidates: readonly string[], query: string): number {
  return candidates.reduce(
    (score, candidate) => Math.max(score, scoreTextMatch(candidate, query)),
    0,
  );
}

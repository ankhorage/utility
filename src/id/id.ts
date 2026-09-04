export interface CompactIdOptions {
  readonly now?: () => number;
  readonly random?: () => number;
  readonly randomLength?: number;
}

/***
 * Create a compact time/random identifier with injectable sources for deterministic testing.
 */
export function createCompactId(prefix: string, options: CompactIdOptions = {}): string {
  const now = options.now ?? Date.now;
  const random = options.random ?? Math.random;
  const randomLength = options.randomLength ?? 6;
  const timePart = Math.max(0, Math.trunc(now())).toString(36);
  const randomPart = random().toString(36).slice(2, 2 + Math.max(0, randomLength));
  return [prefix, timePart, randomPart].filter((part) => part.length > 0).join('-');
}

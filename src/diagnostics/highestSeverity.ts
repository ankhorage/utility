import type { DiagnosticLike } from './types.js';

/*** Resolve the highest-ranked severity from a diagnostics collection. */
export function highestSeverity<TSeverity extends string>(
  diagnostics: readonly DiagnosticLike<TSeverity>[],
  rank: Readonly<Record<TSeverity, number>>,
): TSeverity | undefined {
  return diagnostics.reduce<TSeverity | undefined>((highest, diagnostic) => {
    if (highest === undefined) return diagnostic.severity;
    return rank[diagnostic.severity] > rank[highest] ? diagnostic.severity : highest;
  }, undefined);
}

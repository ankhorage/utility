export interface DiagnosticLike<TSeverity extends string = string, TCode extends string = string> {
  readonly code: TCode;
  readonly message: string;
  readonly severity: TSeverity;
}

/***
 * Create a minimal diagnostic value from code, message, and severity.
 */
export function createDiagnostic<TSeverity extends string, TCode extends string>(
  code: TCode,
  message: string,
  severity: TSeverity,
): DiagnosticLike<TSeverity, TCode> {
  return { code, message, severity };
}

/***
 * Format one code/message/severity diagnostic as a compact display line.
 */
export function formatDiagnostic(diagnostic: DiagnosticLike): string {
  return `[${diagnostic.severity}] ${diagnostic.code}: ${diagnostic.message}`;
}

/***
 * Format multiple diagnostics as newline-separated display text.
 */
export function formatDiagnostics(diagnostics: readonly DiagnosticLike[]): string {
  return diagnostics.map(formatDiagnostic).join('\n');
}

/***
 * Resolve the highest-ranked severity from a diagnostics collection.
 */
export function highestSeverity<TSeverity extends string>(
  diagnostics: readonly DiagnosticLike<TSeverity>[],
  rank: Readonly<Record<TSeverity, number>>,
): TSeverity | undefined {
  return diagnostics.reduce<TSeverity | undefined>((highest, diagnostic) => {
    if (highest === undefined) return diagnostic.severity;
    return rank[diagnostic.severity] > rank[highest] ? diagnostic.severity : highest;
  }, undefined);
}

/***
 * Return a stable copy sorted by severity rank and a caller-provided deterministic key.
 */
export function sortDiagnostics<TDiagnostic extends DiagnosticLike<TSeverity>, TSeverity extends string>(
  diagnostics: readonly TDiagnostic[],
  rank: Readonly<Record<TSeverity, number>>,
  keyOf: (diagnostic: TDiagnostic) => string,
): TDiagnostic[] {
  return diagnostics
    .map((diagnostic, index) => ({ diagnostic, index }))
    .sort((left, right) => {
      const severity = rank[right.diagnostic.severity] - rank[left.diagnostic.severity];
      if (severity !== 0) return severity;
      const key = keyOf(left.diagnostic).localeCompare(keyOf(right.diagnostic));
      return key !== 0 ? key : left.index - right.index;
    })
    .map(({ diagnostic }) => diagnostic);
}

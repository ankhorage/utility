import { formatDiagnostic } from './formatDiagnostic.js';
import type { DiagnosticLike } from './types.js';

/*** Format multiple diagnostics as newline-separated display text. */
export function formatDiagnostics(diagnostics: readonly DiagnosticLike[]): string {
  return diagnostics.map(formatDiagnostic).join('\n');
}

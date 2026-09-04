import type { DiagnosticLike } from './types.js';

/*** Format one code/message/severity diagnostic as a compact display line. */
export function formatDiagnostic(diagnostic: DiagnosticLike): string {
  return `[${diagnostic.severity}] ${diagnostic.code}: ${diagnostic.message}`;
}

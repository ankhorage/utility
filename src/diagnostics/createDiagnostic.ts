import type { DiagnosticLike } from './types.js';

/*** Create a minimal diagnostic value from code, message, and severity. */
export function createDiagnostic<TSeverity extends string, TCode extends string>(
  code: TCode,
  message: string,
  severity: TSeverity,
): DiagnosticLike<TSeverity, TCode> {
  return { code, message, severity };
}

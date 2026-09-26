/*** Read a completed/total pair from regex captures or throw a labeled error. */
export function readCheckSummary(output: string, pattern: RegExp, label: string): string {
  const match = pattern.exec(output);
  if (!match?.[1] || !match[2]) throw new Error(`${label} did not report a complete check count.`);
  return `${match[1]}/${match[2]}`;
}

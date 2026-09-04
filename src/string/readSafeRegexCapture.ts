export interface SafeRegexCaptureOptions {
  readonly maxLength?: number;
  readonly allowWhitespace?: boolean;
}

/*** Read and trim the first regex capture only when it satisfies configured length and whitespace constraints. */
export function readSafeRegexCapture(
  input: string,
  pattern: RegExp,
  options: SafeRegexCaptureOptions = {},
): string | undefined {
  const value = pattern.exec(input)?.at(1)?.trim();
  if (!value) return undefined;
  if (value.length > (options.maxLength ?? 2048)) return undefined;
  if (options.allowWhitespace !== true && /\s/u.test(value)) return undefined;
  return value;
}

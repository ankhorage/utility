import { readEnvString } from './readEnvString.js';

/*** Read a finite numeric environment variable from a Node-style environment record. */
export function readEnvNumber(
  name: string,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): number | undefined {
  const value = readEnvString(name, environment);
  if (value === undefined) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

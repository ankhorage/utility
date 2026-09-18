import { readEnvString } from './readEnvString.js';

/*** Read a strict boolean environment variable from a Node-style environment record. */
export function readEnvBoolean(
  name: string,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): boolean | undefined {
  const value = readEnvString(name, environment);
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

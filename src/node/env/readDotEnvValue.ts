import { stripMatchingQuotes } from '../../string/stripMatchingQuotes.js';

/*** Read a non-empty value by key from dotenv-formatted text. */
export function readDotEnvValue(raw: string, key: string): string | undefined {
  for (const line of raw.split(/\r?\n/u)) {
    const normalized = line.trim().replace(/^export\s+/u, '');
    if (!normalized || normalized.startsWith('#')) continue;
    const separator = normalized.indexOf('=');
    if (separator < 1 || normalized.slice(0, separator).trim() !== key) continue;
    const value = stripMatchingQuotes(normalized.slice(separator + 1).trim());
    if (value.length > 0) return value;
  }
  return undefined;
}

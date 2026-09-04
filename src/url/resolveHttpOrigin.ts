import { parseTcpPort } from '../number/parseTcpPort.js';

/*** Resolve an HTTP origin from a URL value or a localhost port fallback. */
export function resolveHttpOrigin(
  value: string | undefined,
  portValue: string | undefined,
  localhost = '127.0.0.1',
): string | null {
  if (value?.trim()) {
    try {
      return new URL(value.trim()).origin;
    } catch {
      return null;
    }
  }

  const port = parseTcpPort(portValue);
  return port === null ? null : `http://${localhost}:${port}`;
}

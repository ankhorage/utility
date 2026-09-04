/*** Parse a valid TCP port number from an optional string. */
export function parseTcpPort(value: string | undefined): number | null {
  if (!value) return null;
  const port = Number.parseInt(value, 10);
  return Number.isInteger(port) && port >= 1 && port <= 65_535 ? port : null;
}

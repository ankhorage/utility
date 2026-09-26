/*** Allow absent origins and HTTP(S) origins with the supported local or private hostnames. */
export function isOriginAllowed(origin: string | undefined): boolean {
  if (origin === undefined) return true;

  try {
    const url = new URL(origin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

    const hostname = url.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') return true;
    return hostname.startsWith('[') && hostname.endsWith(']')
      ? isAllowedIpv6(hostname.slice(1, -1))
      : isAllowedIpv4(hostname);
  } catch {
    return false;
  }
}

/*** Match the existing IPv6 ULA and link-local origin policy. */
function isAllowedIpv6(address: string): boolean {
  return (
    address.startsWith('fd') ||
    address.startsWith('fe8') ||
    address.startsWith('fe9') ||
    address.startsWith('fea') ||
    address.startsWith('feb')
  );
}

/*** Match the existing IPv4 private-range origin policy. */
function isAllowedIpv4(hostname: string): boolean {
  const parts = hostname.split('.');
  if (parts.length !== 4 || !parts.every((part) => /^\d+$/u.test(part))) return false;
  const octets = parts.map((part) => parseInt(part, 10));
  if (!octets.every((octet) => octet >= 0 && octet <= 255)) return false;
  const [first = -1, second = -1] = octets;
  return (
    first === 10 ||
    (first === 192 && second === 168) ||
    (first === 172 && second >= 16 && second <= 31)
  );
}

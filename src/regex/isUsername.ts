const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,}$/u;

export function isUsername(value: string): boolean {
  return USERNAME_PATTERN.test(value);
}

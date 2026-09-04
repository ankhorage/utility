const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,}$/u;

/***
 * Return whether a string satisfies Utility's username character and length policy.
 */
export function isUsername(value: string): boolean {
  return USERNAME_PATTERN.test(value);
}

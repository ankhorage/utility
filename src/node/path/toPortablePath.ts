/*** Convert backslash path separators to portable forward slashes without normalizing path segments. */
export function toPortablePath(value: string): string {
  return value.replaceAll('\\', '/');
}

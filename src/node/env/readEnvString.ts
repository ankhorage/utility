/*** Read a non-empty own string environment variable from a Node-style environment record. */
export function readEnvString(
  name: string,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): string | undefined {
  if (!Object.hasOwn(environment, name)) return undefined;
  const value: unknown = Reflect.get(environment, name);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

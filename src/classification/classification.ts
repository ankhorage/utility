export type SupportClassification = 'primary' | 'explicit' | 'unsupported';

/***
 * Classify a string key against a primary predicate and an explicit supported-key record.
 */
export function classifySupportedKey(
  key: string,
  isPrimary: (key: string) => boolean,
  explicitSupport: Readonly<Record<string, true>> = {},
): SupportClassification {
  if (isPrimary(key)) return 'primary';
  if (Object.hasOwn(explicitSupport, key) && explicitSupport[key] === true) return 'explicit';
  return 'unsupported';
}

/***
 * Return whether a string key is accepted by either a primary predicate or explicit support record.
 */
export function isSupportedKey(
  key: string,
  isPrimary: (key: string) => boolean,
  explicitSupport: Readonly<Record<string, true>> = {},
): boolean {
  return classifySupportedKey(key, isPrimary, explicitSupport) !== 'unsupported';
}

/***
 * Resolve one of two policy values for supported keys and return undefined for unsupported keys.
 */
export function resolveSupportedPolicy<TPolicy>(args: {
  readonly key: string;
  readonly active: boolean;
  readonly activePolicy: TPolicy;
  readonly inactivePolicy: TPolicy;
  readonly isPrimary: (key: string) => boolean;
  readonly explicitSupport?: Readonly<Record<string, true>>;
}): TPolicy | undefined {
  if (!isSupportedKey(args.key, args.isPrimary, args.explicitSupport)) return undefined;
  return args.active ? args.activePolicy : args.inactivePolicy;
}

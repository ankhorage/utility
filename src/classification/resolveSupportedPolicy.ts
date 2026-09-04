import { isSupportedKey } from './isSupportedKey.js';

/*** Resolve one of two policy values for supported keys and return undefined for unsupported keys. */
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

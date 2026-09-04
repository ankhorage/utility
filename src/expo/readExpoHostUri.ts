import type { ExpoConstantsLike } from './types.js';

/*** Read a non-empty Expo development host URI from an Expo-constants-like value. */
export function readExpoHostUri(constants: ExpoConstantsLike | null | undefined): string | null {
  const hostUri = constants?.expoConfig?.hostUri;
  return typeof hostUri === 'string' && hostUri.length > 0 ? hostUri : null;
}

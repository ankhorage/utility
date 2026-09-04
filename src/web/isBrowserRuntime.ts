/*** Return whether a browser-style window object is exposed by the active runtime. */
export function isBrowserRuntime(): boolean {
  const runtimeWindow: unknown = Reflect.get(globalThis, 'window');
  return typeof runtimeWindow === 'object' && runtimeWindow !== null;
}

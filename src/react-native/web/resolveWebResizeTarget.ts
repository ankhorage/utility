/*** Resolve an unknown view to a resize target only for web execution and when a caller-provided guard accepts it. */
export function resolveWebResizeTarget<TTarget>(
  value: unknown,
  platform: string,
  isResizeTarget: (candidate: unknown) => candidate is TTarget,
): TTarget | null {
  return platform === 'web' && isResizeTarget(value) ? value : null;
}

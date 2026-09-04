import type { WaitForHttpOptions } from './types.js';

/*** Poll an HTTP endpoint until a caller-selected response is ready or a timeout expires. */
export async function waitForHttp(url: string, options: WaitForHttpOptions): Promise<void> {
  const intervalMs = options.intervalMs ?? 250;
  const fetcher = options.fetcher ?? fetch;
  const isReady = options.isReady ?? ((response: Response) => response.status < 500);
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? ((delayMs: number) => new Promise<void>((resolve) => setTimeout(resolve, delayMs)));
  const startedAt = now();

  while (now() - startedAt < options.timeoutMs) {
    try {
      const response = await fetcher(url);
      if (isReady(response)) return;
    } catch {
      // Retry until the timeout expires.
    }
    await sleep(intervalMs);
  }

  throw new Error(`Timed out waiting for ${url}.`);
}

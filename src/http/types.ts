export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface JsonHttpResponse<TValue = unknown> {
  readonly response: Response;
  readonly value: TValue;
}

export interface ParsedJsonRequestOptions<TValue> {
  readonly request: (input: string, init?: RequestInit) => Promise<Response>;
  readonly input: string;
  readonly init?: RequestInit;
  readonly parse: (value: unknown) => TValue;
  readonly assertSafe?: (value: unknown) => void;
  readonly createHttpError?: (value: unknown, response: Response) => Error;
  readonly label?: string;
}

export interface WaitForHttpOptions {
  readonly timeoutMs: number;
  readonly intervalMs?: number;
  readonly fetcher?: FetchLike;
  readonly isReady?: (response: Response) => boolean;
  readonly now?: () => number;
  readonly sleep?: (delayMs: number) => Promise<void>;
}

export interface PublicHttpsAddress {
  readonly address: string;
  readonly family: 4 | 6;
}

export interface PublicHttpsResolvedTarget {
  readonly url: URL;
  readonly address: PublicHttpsAddress;
}

export interface PublicHttpsResponseMetadata {
  readonly status: number;
  readonly location: string | null;
}

export type PublicHttpsLookup = (
  hostname: string,
) => Promise<readonly PublicHttpsAddress[]>;

export type PublicHttpsRequest = (
  target: PublicHttpsResolvedTarget,
  method: 'HEAD' | 'GET',
  timeoutMs: number,
) => Promise<PublicHttpsResponseMetadata>;

export interface PublicHttpsValidationOptions {
  readonly timeoutMs?: number;
  readonly maxRedirects?: number;
  readonly lookup?: PublicHttpsLookup;
  readonly request?: PublicHttpsRequest;
}

export interface PublicHttpsValidationResult {
  readonly url: string;
  readonly status: number;
}

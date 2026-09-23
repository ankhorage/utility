/*** Canonical reusable SemVer syntax patterns for exact versions and common range forms. */
export const SEMVER_PATTERNS = {
  exact: /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u,
  exactWithPrerelease:
    /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u,
  caret: /^\^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u,
  tilde: /^~(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u,
  majorWildcard: /^(?:0|[1-9]\d*)\.x$/u,
  minorWildcard: /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.x$/u,
} as const;

---
'@ankhorage/utility': minor
---

Expose `isOptionalString` from `@ankhorage/utility/string` so consumers can reuse optional-string
validation. The guard accepts `undefined` and all primitive strings, including empty and
whitespace-only strings, and rejects `null` and other types. It has no Contracts dependency.

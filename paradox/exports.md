# Public API

## escapeRegExp

Kind: `function`
Module: `src/regex/escapeRegExp.ts`
Source: `src/regex/escapeRegExp.ts:2:1`

Escapes a literal string so it can be safely embedded in a regular-expression source.

### Signatures

- `(value: string) => string`
  - value: `string`
  - returns: `string`

## isEmail

Kind: `function`
Module: `src/regex/isEmail.ts`
Source: `src/regex/isEmail.ts:7:1`

Return whether a string satisfies Utility's conservative email-address shape validation.

### Signatures

- `(value: string) => boolean`
  - value: `string`
  - returns: `boolean`

## isHttpUrl

Kind: `function`
Module: `src/regex/isHttpUrl.ts`
Source: `src/regex/isHttpUrl.ts:4:1`

Return whether a string is a non-empty HTTP or HTTPS URL with a hostname.

### Signatures

- `(value: string) => boolean`
  - value: `string`
  - returns: `boolean`

## isPhone

Kind: `function`
Module: `src/regex/isPhone.ts`
Source: `src/regex/isPhone.ts:6:1`

Return whether a string has a plausible international phone-number shape.

### Signatures

- `(value: string) => boolean`
  - value: `string`
  - returns: `boolean`

## isUsername

Kind: `function`
Module: `src/regex/isUsername.ts`
Source: `src/regex/isUsername.ts:6:1`

Return whether a string satisfies Utility's username character and length policy.

### Signatures

- `(value: string) => boolean`
  - value: `string`
  - returns: `boolean`

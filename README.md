# @ankhorage/utility

Shared, runtime-neutral utilities for Ankhorage packages and compatible external projects.

The package is organized around focused subpath exports so consumers only depend on the utility domain they need.

## Installation

```bash
bun add @ankhorage/utility
```

## Project detection

`@ankhorage/utility/project` detects composable project traits from package-manifest metadata.

```ts
import { detectProject } from '@ankhorage/utility/project';

const project = detectProject({
  dependencies: {
    expo: '^55.0.0',
    react: '^19.0.0',
    'react-native': '^0.82.0',
  },
  devDependencies: {
    typescript: '^5.9.3',
  },
  packageManager: 'bun@1.3.13',
});

project.traits.has('expo'); // true
project.traits.has('react-native'); // true
project.traits.has('react'); // true
project.traits.has('typescript'); // true
project.traits.has('bun'); // true
```

Detection considers `dependencies`, `devDependencies`, and `peerDependencies`, with optional runtime signals from `engines` and `packageManager`.

The detector returns overlapping traits rather than one exclusive project kind. Consumers can apply their own policy to the result. For example, `@ankhorage/devtools` can map Expo/React Native traits to a React Native ESLint profile while other tools can use the complete trait set.

## Regular expressions

`@ankhorage/utility/regex` exposes broadly reusable patterns and small predicates with explicit semantics.

```ts
import {
  EMAIL_PATTERN,
  URL_PATTERN,
  isEmailLike,
  isUrlLike,
} from '@ankhorage/utility/regex';

isEmailLike('hello@example.com');
isUrlLike('https://ankhorage.com');
```

`EMAIL_PATTERN` is a practical application-level email shape check. `URL_PATTERN` recognizes whitespace-free HTTP and HTTPS URL-like values. Consumers that require protocol parsing or domain-specific validation can layer stricter validation on top.

## Development

```bash
bun install
bun run build
bun run typecheck
bun run lint
bun run format:check
bun run test
bun run knip
bunx @ankhorage/ankh doctor validate .
```

Every function in this package is kept to a maximum of 50 lines.

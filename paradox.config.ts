import { defineParadoxConfig } from '@ankhorage/paradox';

export default defineParadoxConfig({
  mode: 'write',
  docs: {
    title: '@ankhorage/utility',
    description:
      'Shared, runtime-neutral utilities for Ankhorage packages and compatible external projects.',
  },
  package: {
    root: '.',
    entrypoints: ['src/project/index.ts', 'src/regex/index.ts'],
  },
  output: {
    dir: './paradox',
  },
});

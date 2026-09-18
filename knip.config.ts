import { createKnipConfig } from '@ankhorage/devtools/knip';

export default createKnipConfig({
  entry: ['src/**/index.ts'],
  ignoreBinaries: ['open', 'rundll32.exe', 'xdg-open'],
  ignoreFiles: [
    // Maintainer-requested commented source awaiting a separate image-analysis repository.
    'src/image/**',
    '.prettierrc.js',
    'eslint.config.mjs',
    'eslint.local.config.mjs',
    'paradox.config.ts',
    'prettier.local.config.js',
  ],
});

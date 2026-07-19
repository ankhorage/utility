import { createKnipConfig } from '@ankhorage/devtools/knip';

export default createKnipConfig({
  entry: ['src/project/index.ts', 'src/regex/index.ts'],
  ignoreFiles: ['.prettierrc.js', 'eslint.config.mjs', 'paradox.config.ts'],
});

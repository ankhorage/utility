import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createConfig } from '@ankhorage/devtools/eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default createConfig({
  tsconfigRootDir: __dirname,
  project: ['./tsconfig.json'],
  files: ['src/**/*.ts'],
  overrides: [
    {
      files: ['src/**/*.ts'],
      rules: {
        'max-lines-per-function': [
          'error',
          {
            max: 50,
            skipBlankLines: true,
            skipComments: true,
          },
        ],
      },
    },
  ],
});

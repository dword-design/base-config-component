import type { Base } from '@dword-design/base';
import { defineBaseConfig } from '@dword-design/base';
import depcheckParserSass from '@dword-design/depcheck-parser-sass';
import depcheck from 'depcheck';
import endent from 'endent';
import outputFiles from 'output-files';

import { BaseConfig } from './base-config';
import build from './build';
import getEntry from './get-entry';
import getReadmeInstallString from './get-readme-install-string';
import prepublishOnly from './prepublish-only';
import viteConfig from './vite-config';

export default defineBaseConfig(function (
  this: Base<BaseConfig>,
  config: BaseConfig,
) {
  return {
    allowedMatches: Object.keys({
      'entry.ts': true,
      src: true,
      'vite.config.ts': true,
    }),
    commands: { build, prepublishOnly },
    depcheckConfig: {
      parsers: {
        '**/*.scss': depcheckParserSass,
        '**/*.vue': depcheck.parser.vue,
      },
    },
    editorIgnore: ['.browserslistrc', 'dist', 'vite.config.ts'],
    eslintConfig: endent`
      import { defineConfig, globalIgnores } from 'eslint/config';
      import config from '@dword-design/eslint-config';

      export default defineConfig([
        globalIgnores(['eslint.config.ts', 'eslint.lint-staged.config.ts', 'vite.config.ts', 'entry.ts']),
        config,
      ]);\n
    `,
    gitignore: ['/dist', '.browserslistrc'],
    npmPublish: true,
    packageConfig: {
      browser: 'dist/index.min.js',
      exports: {
        '.': {
          import: {
            default: './dist/index.esm.js',
            types: './dist/entry.d.ts',
          },
        },
      },
      main: 'dist/index.esm.js',
      unpkg: 'dist/index.min.js',
    },
    prepare: () =>
      outputFiles(this.cwd, {
        '.browserslistrc': endent`
          current node
          last 2 versions and > 2%
          ie > 10\n
        `,
        'entry.ts': getEntry(config, { cwd: this.cwd }),
        'vite.config.ts': viteConfig,
      }),
    readmeInstallString: getReadmeInstallString(config, { cwd: this.cwd }),
  };
});

// TODO: Otherwise the full type of the config cannot be inferred by TypeScript when used somewhere else

export { default as build } from './build';

export { default as prepublishOnly } from './prepublish-only';

export { BaseConfig } from './base-config';

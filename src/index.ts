import pathLib from 'node:path';

import type { Base, PartialCommandOptions } from '@dword-design/base';
import { defineBaseConfig } from '@dword-design/base';
import depcheckParserSass from '@dword-design/depcheck-parser-sass';
import depcheck from 'depcheck';
import endent from 'endent';
import fs from 'fs-extra';
import { build } from 'vite';

import { BaseConfig } from './base-config';
import getEntry from './get-entry';
import getReadmeInstallString from './get-readme-install-string';
import viteConfig from './vite-config';

export default defineBaseConfig(function (
  this: Base<BaseConfig>,
  config: BaseConfig,
) {
  return {
    allowedMatches: ['src'],
    commands: {
      prepublishOnly: {
        handler: async (options: PartialCommandOptions = {}) => {
          options = { log: process.env.NODE_ENV !== 'test', ...options };

          await build({
            root: this.cwd,
            ...viteConfig,
            ...(!options.log && { logLevel: 'warn' }),
          });
        },
      },
    },
    depcheckConfig: {
      parsers: {
        '**/*.scss': depcheckParserSass,
        '**/*.vue': depcheck.parser.vue,
      },
    },
    editorIgnore: ['dist', '.browserslistrc'],
    gitignore: ['/dist', '.browserslistrc'],
    npmPublish: true,
    packageConfig: {
      '.': {
        import: { default: './dist/index.esm.js', types: './dist/entry.d.ts' },
      },
      browser: 'dist/index.min.js',
      main: 'dist/index.esm.js',
      unpkg: 'dist/index.min.js',
    },
    prepare: () =>
      Promise.all([
        fs.outputFile(
          pathLib.join(this.cwd, '.browserslistrc'),
          endent`
            current node
            last 2 versions and > 2%
            ie > 10

          `,
        ),
        fs.outputFile(
          pathLib.join(this.cwd, 'entry.ts'),
          getEntry(config, { cwd: this.cwd }),
        ),
      ]),
    readmeInstallString: getReadmeInstallString(config, { cwd: this.cwd }),
  };
});

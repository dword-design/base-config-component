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

          try {
            await fs.outputFile(
              pathLib.join(this.cwd, 'src', 'entry.ts'),
              getEntry(config, { cwd: this.cwd }),
            );

            await build({
              root: this.cwd,
              ...viteConfig,
              ...(!options.log && { logLevel: 'warn' }),
            });
          } finally {
            await fs.remove(pathLib.join(this.cwd, 'src', 'entry.ts'));
          }
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
      browser: 'dist/index.min.js',
      exports: './dist/index.esm.js',
      main: 'dist/index.esm.js',
      unpkg: 'dist/index.min.js',
    },
    prepare: () =>
      fs.outputFile(
        pathLib.join(this.cwd, '.browserslistrc'),
        endent`
          current node
          last 2 versions and > 2%
          ie > 10

        `,
      ),
    readmeInstallString: getReadmeInstallString(config, { cwd: this.cwd }),
  };
});

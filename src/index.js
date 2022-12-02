import depcheckParserSass from '@dword-design/depcheck-parser-sass'
import { endent } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import depcheckParserVue from 'depcheck-parser-vue'
import { execa } from 'execa'
import fs from 'fs-extra'
import { createRequire } from 'module'
import P from 'path'

import getEntry from './get-entry.js'
import getReadmeInstallString from './get-readme-install-string.js'

const _require = createRequire(import.meta.url)

export default config => ({
  allowedMatches: ['src'],
  commands: {
    prepublishOnly: async (options = {}) => {
      options = { log: true, ...options }
      try {
        await fs.outputFile(P.join('src', 'entry.js'), getEntry())
        await fs.remove('dist')
        await execa(
          packageName`rollup`,
          [
            '--config',
            _require.resolve(
              packageName`@dword-design/rollup-config-component`
            ),
          ],
          {
            env: { NODE_ENV: 'production' },
            ...(options.log ? { stdio: 'inherit' } : {}),
          }
        )
      } finally {
        await fs.remove(P.join('src', 'entry.js'))
      }
    },
  },
  coverageFileExtensions: ['.vue'],
  depcheckConfig: {
    parsers: {
      '**/*.scss': depcheckParserSass,
      '**/*.vue': depcheckParserVue,
    },
  },
  editorIgnore: ['dist', '.browserslistrc'],
  gitignore: ['/dist', '.browserslistrc'],
  npmPublish: true,
  packageConfig: {
    browser: 'dist/index.esm.js',
    main: 'dist/index.ssr.js',
    module: 'dist/index.esm.js',
    unpkg: 'dist/index.min.js',
  },
  prepare: () =>
    fs.outputFile(
      '.browserslistrc',
      endent`
        current node
        last 2 versions and > 2%
        ie > 10

      `
    ),
  readmeInstallString: getReadmeInstallString(config),
})

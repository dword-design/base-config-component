import depcheckParserSass from '@dword-design/depcheck-parser-sass'
import { endent } from '@dword-design/functions'
import depcheckParserVue from 'depcheck-parser-vue'
import fs from 'fs-extra'
import P from 'path'
import { build } from 'vite'

import getEntry from './get-entry.js'
import getReadmeInstallString from './get-readme-install-string.js'
import viteConfig from './vite-config.js'

export default config => ({
  allowedMatches: ['src'],
  commands: {
    prepublishOnly: async (options = {}) => {
      options = { log: process.env.NODE_ENV !== 'test', ...options }
      try {
        await fs.outputFile(P.join('src', 'entry.js'), getEntry())
        await build({
          ...viteConfig,
          ...(!options.log && { logLevel: 'warn' }),
        })
      } finally {
        await fs.remove(P.join('src', 'entry.js'))
      }
    },
  },
  depcheckConfig: {
    parsers: {
      '**/*.scss': depcheckParserSass,
      '**/*.vue': depcheckParserVue,
    },
  },
  editorIgnore: ['dist', '.browserslistrc'],
  gitignore: ['/dist', '.browserslistrc'],
  nodeVersion: 18,
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

      `,
    ),
  readmeInstallString: getReadmeInstallString(config),
})

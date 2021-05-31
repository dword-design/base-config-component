import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { outputFile } from 'fs-extra'
import stealthyRequire from 'stealthy-require'

export default tester(
  {
    string: async () => {
      await outputFile(
        'package.json',
        JSON.stringify({
          baseConfig: 'component',
        })
      )
      expect(
        stealthyRequire(require.cache, () => require('./base-config'))
      ).toEqual({})
    },
    valid: async () => {
      await outputFile(
        'package.json',
        JSON.stringify({
          baseConfig: {
            cdnExtraScripts: [
              '<script src="https://unpkg.com/mermaid/dist/mermaid.min.js"></script>',
            ],
            name: 'component',
          },
        })
      )
      expect(
        stealthyRequire(require.cache, () => require('./base-config'))
      ).toEqual({
        cdnExtraScripts: [
          '<script src="https://unpkg.com/mermaid/dist/mermaid.min.js"></script>',
        ],
        name: 'component',
      })
    },
  },
  [testerPluginTmpDir()]
)

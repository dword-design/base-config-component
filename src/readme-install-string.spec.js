import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { outputFile } from 'fs-extra'
import stealthyRequire from 'stealthy-require'

export default tester(
  {
    async valid() {
      await outputFile(
        'package.json',
        JSON.stringify({
          baseConfig: {
            cdnExtraScripts: [
              '<script src="https://unpkg.com/mermaid/dist/mermaid.min.js"></script>',
            ],
          },
          name: 'foo-bar',
        })
      )
      expect(
        stealthyRequire(require.cache, () => require('./readme-install-string'))
      ).toMatchSnapshot(this)
    },
  },
  [testerPluginTmpDir()]
)

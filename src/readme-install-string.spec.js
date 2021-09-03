import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { outputFile } from 'fs-extra'
import stealthyRequire from 'stealthy-require-no-leak'

export default tester(
  {
    'extra scripts': async function () {
      await outputFile('package.json', JSON.stringify({ name: 'foo-bar' }))

      const self = stealthyRequire(require.cache, () =>
        require('./readme-install-string')
      )
      expect(
        self({
          cdnExtraScripts: [
            '<script src="https://unpkg.com/mermaid/dist/mermaid.min.js"></script>',
          ],
        })
      ).toMatchSnapshot(this)
    },
    async valid() {
      await outputFile('package.json', JSON.stringify({ name: 'foo-bar' }))

      const self = stealthyRequire(require.cache, () =>
        require('./readme-install-string')
      )
      expect(self()).toMatchSnapshot(this)
    },
  },
  [testerPluginTmpDir()]
)

import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import fs from 'fs-extra'

import self from './get-readme-install-string.js'

export default tester(
  {
    async 'extra scripts'() {
      await fs.outputFile('package.json', JSON.stringify({ name: 'foo-bar' }))
      expect(
        self({
          cdnExtraScripts: [
            '<script src="https://unpkg.com/mermaid/dist/mermaid.min.js"></script>',
          ],
        }),
      ).toMatchSnapshot(this)
    },
    async valid() {
      await fs.outputFile('package.json', JSON.stringify({ name: 'foo-bar' }))
      expect(self()).toMatchSnapshot(this)
    },
  },
  [testerPluginTmpDir()],
)

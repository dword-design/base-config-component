import { Base } from '@dword-design/base'
import chdir from '@dword-design/chdir'
import { endent } from '@dword-design/functions'
import puppeteer from '@dword-design/puppeteer'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { loadNuxt } from '@nuxt/kit'
import { execaCommand } from 'execa'
import fileUrl from 'file-url'
import fs from 'fs-extra'
import { build } from 'nuxt'
import outputFiles from 'output-files'
import { pEvent } from 'p-event'
import P from 'path'
import kill from 'tree-kill-promise'

import self from './index.js'
import { vueCdnScript } from './variables.js'

export default tester(
  {
    component: async () => {
      await outputFiles({
        'pages/index.vue': endent`
          <template>
            <div class="tmp-component">Hello world</div>
          </template>
        `,
      })

      const nuxt = await loadNuxt({ config: { telemetry: false } })
      await build(nuxt)

      const childProcess = execaCommand('nuxt start', { all: true })
      await pEvent(
        childProcess.all,
        'data',
        data => data.toString() === 'Listening http://[::]:3000\n'
      )

      const browser = await puppeteer.launch()

      const page = await browser.newPage()
      try {
        await page.goto('http://localhost:3000')

        const component = await page.waitForSelector('.tmp-component')
        expect(await component.evaluate(el => el.innerText)).toEqual(
          'Hello world'
        )
      } finally {
        await browser.close()
        await kill(childProcess.pid)
      }
    },
    script: async () => {
      await fs.outputFile(
        'index.html',
        endent`
        <body>
          ${vueCdnScript}
          <script src="../tmp-component/dist/index.min.js"></script>
        
          <div id="app"></div>
        
          <script>
            const app = Vue.createApp({
              template: '<tmp-component />',
            })
            app.component('TmpComponent', TmpComponent)
            app.mount('#app')
          </script>
        </body>
      `
      )

      const browser = await puppeteer.launch()

      const page = await browser.newPage()
      try {
        await page.goto(fileUrl('index.html'))

        const component = await page.waitForSelector('.tmp-component')
        expect(await component.evaluate(el => el.innerText)).toEqual(
          'Hello world'
        )
      } finally {
        await browser.close()
      }
    },
  },
  [
    {
      after: () => fs.remove('tmp-component'),
      before: async () => {
        await fs.mkdir('tmp-component')
        await chdir('tmp-component', async () => {
          await outputFiles({
            'package.json': JSON.stringify({
              baseConfig: P.resolve('..', 'src', 'index.js'),
              name: 'tmp-component',
            }),
            'src/index.vue': endent`
              <template>
                <div class="tmp-component">Hello world</div>
              </template>
            `,
          })
          await new Base(self).prepare()
          await self().commands.prepublishOnly({ log: false })
        })
      },
    },
    testerPluginTmpDir(),
  ]
)

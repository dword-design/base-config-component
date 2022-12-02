import { Base } from '@dword-design/base'
import chdir from '@dword-design/chdir'
import { endent } from '@dword-design/functions'
import puppeteer from '@dword-design/puppeteer'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import fileUrl from 'file-url'
import fs from 'fs-extra'
import { Builder, Nuxt } from 'nuxt'
import outputFiles from 'output-files'

import self from './index.js'
import { vueCdnScript } from './variables.js'

export default tester(
  {
    component: async () => {
      await outputFiles({
        'pages/index.vue': endent`
          <template>
            <tmp-component />
          </template>

          <script>
          import TmpComponent from '../../tmp-component'

          export default {
            components: {
              TmpComponent,
            },
          }
          </script>
        `,
      })

      const nuxt = new Nuxt()
      await new Builder(nuxt).build()
      await nuxt.listen()

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
        await nuxt.close()
      }
    },
    plugin: async () => {
      await outputFiles({
        'pages/index.vue': endent`
          <template>
            <tmp-component />
          </template>
        `,
        'plugins/plugin.js': endent`
          import Vue from 'vue'
          import TmpComponent from '../../tmp-component'
          
          Vue.use(TmpComponent)
        `,
      })

      const nuxt = new Nuxt({ plugins: ['~/plugins/plugin.js'] })
      await new Builder(nuxt).build()
      await nuxt.listen()

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
        await nuxt.close()
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
            new Vue({
              el: '#app',
              template: '<tmp-component />',
            })
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
            'node_modules/base-config-self/index.js':
              "module.exports = require('../../../src')",
            'package.json': JSON.stringify({
              baseConfig: 'self',
              name: 'tmp-component',
            }),
            'src/index.vue': endent`
              <script>
              export default {
                render: () => <div class="tmp-component">Hello world</div>
              }
              </script>
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

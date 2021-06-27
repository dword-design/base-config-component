import chdir from '@dword-design/chdir'
import { endent } from '@dword-design/functions'
import puppeteer from '@dword-design/puppeteer'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import execa from 'execa'
import fileUrl from 'file-url'
import { outputFile } from 'fs-extra'
import { Builder, Nuxt } from 'nuxt'
import outputFiles from 'output-files'

export default tester(
  {
    component: async () => {
      await outputFiles({
        'pages/index.vue': endent`
          <template>
            <my-component class="my-component" />
          </template>

          <script>
          import MyComponent from '../../my-component'

          export default {
            components: {
              MyComponent,
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

        const component = await page.waitForSelector('.my-component')
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
            <my-component class="my-component" />
          </template>
        `,
        'plugins/plugin.js': endent`
          import Vue from 'vue'
          import MyComponent from '../../my-component'
          
          Vue.use(MyComponent)
        `,
      })

      const nuxt = new Nuxt({ plugins: ['~/plugins/plugin.js'] })
      await new Builder(nuxt).build()
      await nuxt.listen()

      const browser = await puppeteer.launch()

      const page = await browser.newPage()
      try {
        await page.goto('http://localhost:3000')

        const component = await page.waitForSelector('.my-component')
        expect(await component.evaluate(el => el.innerText)).toEqual(
          'Hello world'
        )
      } finally {
        await browser.close()
        await nuxt.close()
      }
    },
    script: async () => {
      await outputFile(
        'index.html',
        endent`
        <body>
          <script src="https://unpkg.com/vue"></script>
          <script src="../my-component/dist/index.min.js"></script>
        
          <div id="app">
            <my-component class="my-component" />
          </div>
        
          <script>
            new Vue({ el: '#app' })
          </script>
        </body>
      `
      )

      const browser = await puppeteer.launch()

      const page = await browser.newPage()
      try {
        await page.goto(fileUrl('index.html'))

        const component = await page.waitForSelector('.my-component')
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
      transform: test => async () => {
        await outputFiles({
          app: test.appFiles,
          'my-component': {
            'node_modules/base-config-self/index.js':
              "module.exports = require('../../../../src')",
            'package.json': JSON.stringify({
              baseConfig: 'self',
              name: 'my-component',
            }),
            'src/index.vue': endent`
              <script>
              export default {
                render: () => <div>Hello world</div>
              }
              </script>
            `,
          },
        })
        await chdir('my-component', async () => {
          await execa.command('base prepare')
          await execa.command('base prepublishOnly')
        })
        await chdir('app', test)
      },
    },
    testerPluginTmpDir(),
  ]
)

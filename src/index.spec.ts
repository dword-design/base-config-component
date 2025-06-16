import pathLib from 'node:path';

import { Base } from '@dword-design/base';
import { expect, test } from '@playwright/test';
import endent from 'endent';
import { execaCommand } from 'execa';
import fileUrl from 'file-url';
import getPort from 'get-port';
import nuxtDevReady from 'nuxt-dev-ready';
import outputFiles from 'output-files';
import kill from 'tree-kill-promise';

import { vueCdnScript } from './variables';

test('component', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ name: 'tmp-component' }),
    'pages/index.vue': endent`
      <template>
        <tmp-component />
      </template>

      <script setup>
      import TmpComponent from '..';
      </script>
    `,
    'src/index.vue': endent`
      <template>
        <div class="tmp-component">Hello world</div>
      </template>
    `,
  });

  const base = new Base({ name: '../../src' }, { cwd });
  await base.prepare();
  await base.run('prepublishOnly');
  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: port },
    reject: false,
    stderr: 'inherit',
  });

  try {
    await nuxtDevReady(port);
    await page.goto(`http://localhost:${port}`);
    await expect(page.locator('.tmp-component')).toHaveText('Hello world');
  } finally {
    await kill(nuxt.pid);
  }
});

test('custom name', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ name: 'foo' }),
    'pages/index.vue': endent`
      <template>
        <tmp-component />
      </template>
    `,
    'plugins/plugin.ts': endent`
      import TmpComponent from '..';

      export default defineNuxtPlugin(nuxtApp => nuxtApp.vueApp.use(TmpComponent));
    `,
    'src/index.vue': endent`
      <template>
        <div class="tmp-component">Hello world</div>
      </template>
    `,
  });

  const base = new Base(
    { componentName: 'TmpComponent', name: '../../src' },
    { cwd },
  );

  await base.prepare();
  await base.run('prepublishOnly');
  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: port },
    reject: false,
    stderr: 'inherit',
  });

  try {
    await nuxtDevReady(port);
    await page.goto(`http://localhost:${port}`);
    await expect(page.locator('.tmp-component')).toHaveText('Hello world');
  } finally {
    await kill(nuxt.pid);
  }
});

test('plugin', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ name: 'tmp-component' }),
    'pages/index.vue': endent`
      <template>
        <tmp-component />
      </template>
    `,
    'plugins/plugin.ts': endent`
      import TmpComponent from '..';

      export default defineNuxtPlugin(nuxtApp => nuxtApp.vueApp.use(TmpComponent));
    `,
    'src/index.vue': endent`
      <template>
        <div class="tmp-component">Hello world</div>
      </template>
    `,
  });

  const base = new Base({ name: '../../src' }, { cwd });
  await base.prepare();
  await base.run('prepublishOnly');
  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: port },
    reject: false,
    stderr: 'inherit',
  });

  try {
    await nuxtDevReady(port);
    await page.goto(`http://localhost:${port}`);
    await expect(page.locator('.tmp-component')).toHaveText('Hello world');
  } finally {
    await kill(nuxt.pid);
  }
});

test('script', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'index.html': endent`
      <body>
        ${vueCdnScript}
        <script src="./dist/index.min.js"></script>

        <div id="app"></div>

        <script>
          const app = Vue.createApp({
            template: '<tmp-component />',
          })
          app.component('TmpComponent', TmpComponent)
          app.mount('#app')
        </script>
      </body>
    `,
    'package.json': JSON.stringify({ name: 'tmp-component' }),
    'src/index.vue': endent`
      <template>
        <div class="tmp-component">Hello world</div>
      </template>
    `,
  });

  const base = new Base({ name: '../../src' }, { cwd });
  await base.prepare();
  await base.run('prepublishOnly');
  await page.goto(fileUrl(pathLib.join(cwd, 'index.html')));
  await expect(page.locator('.tmp-component')).toHaveText('Hello world');
});

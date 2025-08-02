import pathLib from 'node:path';

import { Base } from '@dword-design/base';
import { expect, test } from '@playwright/test';
import endent from 'endent';
import { execaCommand } from 'execa';
import fileUrl from 'file-url';
import getPort from 'get-port';
import { globby } from 'globby';
import nuxtDevReady from 'nuxt-dev-ready';
import outputFiles from 'output-files';
import kill from 'tree-kill-promise';

import type { BaseConfig } from './base-config';
import { vueCdnScript } from './variables';

test('component', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'node_modules/tmp-component': {
      'package.json': JSON.stringify({ name: 'tmp-component' }),
      'src/index.vue': endent`
        <template>
          <div class="tmp-component">Hello world</div>
        </template>
      `,
    },
    'pages/index.vue': endent`
      <template>
        <tmp-component />
      </template>

      <script setup>
      import TmpComponent from 'tmp-component';
      </script>
    `,
  });

  const base = new Base(
    { name: '../../../../src' },
    { cwd: pathLib.join(cwd, 'node_modules', 'tmp-component') },
  );

  await base.prepare();
  await base.run('prepublishOnly');
  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: String(port) },
    reject: false,
    stderr: 'inherit',
  });

  try {
    await nuxtDevReady(port);
    await page.goto(`http://localhost:${port}`);
    await expect(page.locator('.tmp-component')).toHaveText('Hello world');
  } finally {
    await kill(nuxt.pid!);
  }
});

test('generated files', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ name: 'tmp-component' }),
    'src/index.vue': endent`
      <template>
        <div />
      </template>
    `,
  });

  const base = new Base({ name: '../../src' }, { cwd });
  await base.prepare();
  await base.run('prepublishOnly');
  const files = await globby('**', { cwd: pathLib.join(cwd, 'dist') });

  expect(files).toEqual([
    'entry.d.ts',
    'eslint.config.d.ts',
    'index.esm.js',
    'index.min.js',
    'vite.config.d.ts',
    'src/index.vue.d.ts',
  ]);
});

test('custom name', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'node_modules/foo': {
      'package.json': JSON.stringify({ name: 'foo' }),
      'src/index.vue': endent`
        <template>
          <div class="tmp-component">Hello world</div>
        </template>
      `,
    },
    'pages/index.vue': endent`
      <template>
        <tmp-component />
      </template>
    `,
    'plugins/plugin.ts': endent`
      import TmpComponent from 'foo';

      export default defineNuxtPlugin(({ vueApp }) => vueApp.use(TmpComponent));
    `,
  });

  // Type-safe configuration creation with componentName support
  const base = new Base<BaseConfig>(
    { componentName: 'TmpComponent', name: '../../../../src' },
    { cwd: pathLib.join(cwd, 'node_modules', 'foo') },
  );

  await base.prepare();
  await base.run('prepublishOnly');
  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: String(port) },
    reject: false,
    stderr: 'inherit',
  });

  try {
    await nuxtDevReady(port);
    await page.goto(`http://localhost:${port}`);
    await expect(page.locator('.tmp-component')).toHaveText('Hello world');
  } finally {
    await kill(nuxt.pid!);
  }
});

test('plugin', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'node_modules/tmp-component': {
      'package.json': JSON.stringify({ name: 'tmp-component' }),
      'src/index.vue': endent`
        <template>
          <div class="tmp-component">Hello world</div>
        </template>
      `,
    },
    'pages/index.vue': endent`
      <template>
        <tmp-component />
      </template>
    `,
    'plugins/plugin.ts': endent`
      import TmpComponent from 'tmp-component';

      export default defineNuxtPlugin(({ vueApp }) => vueApp.use(TmpComponent));
    `,
  });

  const base = new Base(
    { name: '../../../../src' },
    { cwd: pathLib.join(cwd, 'node_modules', 'tmp-component') },
  );

  await base.prepare();
  await base.run('prepublishOnly');
  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: String(port) },
    reject: false,
    stderr: 'inherit',
  });

  try {
    await nuxtDevReady(port);
    await page.goto(`http://localhost:${port}`);
    await expect(page.locator('.tmp-component')).toHaveText('Hello world');
  } finally {
    await kill(nuxt.pid!);
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

import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import fs from 'fs-extra';

import self from './get-readme-install-string';

test('extra scripts', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ name: 'foo-bar' }),
  );

  expect(
    self(
      {
        cdnExtraScripts: [
          '<script src="https://unpkg.com/mermaid/dist/mermaid.min.js"></script>',
        ],
      },
      { cwd },
    ),
  ).toMatchSnapshot();
});

test('valid', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ name: 'foo-bar' }),
  );

  expect(self({}, { cwd })).toMatchSnapshot();
});

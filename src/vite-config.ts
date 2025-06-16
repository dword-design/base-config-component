import P from 'node:path';

import vue from '@vitejs/plugin-vue';

export default {
  build: {
    lib: {
      entry: P.join('src', 'entry.ts'),
      fileName: format => `index.${format === 'iife' ? 'min' : 'esm'}.js`,
      formats: ['es', 'iife'],
      name: 'Lib',
    },
    rollupOptions: { external: ['vue'], output: { globals: { vue: 'Vue' } } },
  },
  plugins: [vue()],
};

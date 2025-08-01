import vue from '@vitejs/plugin-vue';
import type { LibraryFormats } from 'vite';
import dts from 'vite-plugin-dts';

export default {
  build: {
    lib: {
      entry: 'entry.ts',
      fileName: format => `index.${format === 'iife' ? 'min' : 'esm'}.js`,
      formats: ['es', 'iife'] as LibraryFormats[], // TODO: The cast shouldn't be necessary
      name: 'Lib',
    },
    rollupOptions: { external: ['vue'], output: { globals: { vue: 'Vue' } } },
  },
  plugins: [vue(), dts()],
};

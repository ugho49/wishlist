import { defineConfig, splitVendorChunkPlugin } from 'vite';
import { mergeConfig, defineConfig as defineTestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import browserslistToEsbuild from 'browserslist-to-esbuild';

const viteConfig = defineConfig({
  cacheDir: '../../node_modules/.vite/front',

  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  build: {
    target: browserslistToEsbuild(),
  },

  plugins: [react(), svgr(), splitVendorChunkPlugin(), nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },
});

const vitestConfig = defineTestConfig({
  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    coverage: {
      provider: 'v8',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});

export default mergeConfig(viteConfig, vitestConfig);

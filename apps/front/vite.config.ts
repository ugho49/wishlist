/// <reference types='vitest' />
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import browserslistToEsbuild from 'browserslist-to-esbuild';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/front',

  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  build: {
    target: browserslistToEsbuild(),
    outDir: '../../dist/apps/front',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  plugins: [react(), svgr(), splitVendorChunkPlugin(), nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/front',
      provider: 'v8',
    },
  },
});

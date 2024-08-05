import type { UserConfig } from 'vite'
import type { InlineConfig } from 'vitest/node'

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import react from '@vitejs/plugin-react'
import browserslistToEsbuild from 'browserslist-to-esbuild'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

type ViteConfig = UserConfig & { test: InlineConfig }

const config: ViteConfig = {
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
    emptyOutDir: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  plugins: [react(), svgr(), nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    reporters: ['default'],
    passWithNoTests: true,
    watch: false,
    coverage: {
      reportsDirectory: '../../coverage/apps/front',
      provider: 'v8',
    },
  },
}

export default defineConfig(config)

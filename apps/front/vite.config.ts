import type { UserConfig } from 'vite'

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import browserslistToEsbuild from 'browserslist-to-esbuild'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

const config: UserConfig = {
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

  plugins: [
    devtools(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    svgr(),
    nxViteTsPaths(),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
}

export default defineConfig(config)

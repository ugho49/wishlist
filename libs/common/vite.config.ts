import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import swc from 'unplugin-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/common',
  plugins: [nxViteTsPaths(), swc.vite()],
})

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import swc from 'unplugin-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/api',
  // `runtime: 'automatic'` makes SWC honor the `jsx: react-jsx` setting used by the
  // react-email templates in `@wishlist/mail` (otherwise SWC defaults to the classic
  // runtime and JSX fails with "React is not defined" under vitest).
  plugins: [nxViteTsPaths(), swc.vite({ jsc: { transform: { react: { runtime: 'automatic' } } } })],
})

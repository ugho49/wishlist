import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.spec.{ts,tsx}'],
      reporters: ['default', 'junit'],
      outputFile: '../../junit_reports/unit/front.xml',
      passWithNoTests: true,
      watch: false,
      coverage: {
        enabled: false,
      },
    },
  }),
)

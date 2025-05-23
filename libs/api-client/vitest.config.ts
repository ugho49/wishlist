import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: 'api-client (unit)',
      passWithNoTests: true,
      watch: false,
      globals: true,
      environment: 'node',
      reporters: ['default', 'junit'],
      outputFile: '../../junit_reports/unit/api-client.xml',
      include: ['src/**/*.spec.ts'],
      setupFiles: ['../../vitest.matchers.ts'],
      coverage: {
        enabled: false,
      },
    },
  }),
)

import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: 'integration-test-plugin (unit)',
      passWithNoTests: true,
      watch: false,
      globals: true,
      environment: 'node',
      reporters: ['default', 'junit'],
      outputFile: '../../junit_reports/unit/integration-test-plugin.xml',
      include: ['src/**/*.spec.ts'],
      coverage: {
        enabled: false,
      },
    },
  }),
)

import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: 'api (integration)',
      passWithNoTests: true,
      watch: false,
      globals: true,
      environment: 'node',
      reporters: ['default', 'junit'],
      outputFile: '../../junit_reports/integration/api.xml',
      include: ['src/**/*.int-spec.ts'],
      setupFiles: ['../../vitest.matchers.ts', './test-utils/handle-uncaught-errors.ts'],
      fileParallelism: true,
      maxWorkers: 4,
      testTimeout: 30000,
      hookTimeout: 60000,
      teardownTimeout: 30000,
      coverage: {
        enabled: false,
      },
      server: {
        deps: {
          inline: [/@nestjs/],
        },
      },
    },
  }),
)

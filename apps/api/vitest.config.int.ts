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
      globalSetup: ['./int-tests.global-setup.ts'],
      setupFiles: ['../../vitest.matchers.ts'],
      // Enable parallel test execution for faster test runs
      // Each worker gets its own isolated database
      fileParallelism: true,
      // Allow up to 4 test files to run concurrently
      // Adjust based on available CPU cores and resources
      maxWorkers: 4,
      minWorkers: 1,
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

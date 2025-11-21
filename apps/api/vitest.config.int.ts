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
      // No global setup needed - each worker manages its own Docker Compose environment
      setupFiles: ['../../vitest.matchers.ts'],
      // Enable parallel test execution for faster test runs
      // Each worker gets its own isolated Docker Compose environment (db, mail, valkey)
      fileParallelism: true,
      // Allow up to 4 test files to run concurrently
      // Adjust based on available CPU cores and resources
      // Note: Each worker starts its own Docker containers
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

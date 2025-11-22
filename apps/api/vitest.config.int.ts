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
      // Global setup starts multiple Docker Compose environments (one per worker)
      globalSetup: ['./int-tests.global-setup.ts'],
      setupFiles: ['../../vitest.matchers.ts'],
      // Enable parallel test execution for faster test runs
      // Each worker gets its own isolated Docker Compose environment (db, mail, valkey)
      // Environment variables are exposed as: DOCKER_WORKER_${workerId}_${service}_PORT_${port}
      fileParallelism: true,
      // Allow up to 4 test files to run concurrently
      // IMPORTANT: This must match MAX_WORKERS in int-tests.global-setup.ts
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

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
      fileParallelism: false,
      coverage: {
        enabled: false,
      },
    },
  }),
)

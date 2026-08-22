import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
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
);

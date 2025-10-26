import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 20000,
    hookTimeout: 20000,
    projects: ['./(apps|libs)/**/vitest.config.ts', './(apps|libs)/**/vitest.config.int.ts'],
  },
})

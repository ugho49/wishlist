import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    watch: false,
    testTimeout: 20000,
    hookTimeout: 20000,
    fileParallelism: false,
  },
})

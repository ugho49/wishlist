import { defineWorkspace } from 'vitest/config'

export default defineWorkspace(['./(apps|libs)/**/vitest.config.ts', './(apps|libs)/**/vitest.config.int.ts'])

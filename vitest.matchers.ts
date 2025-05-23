import jestExtendedMatchers from 'jest-extended'
import { expect } from 'vitest'

expect.extend({
  ...jestExtendedMatchers,
})

import jestExtendedMatchers from 'jest-extended'

import { expect } from 'bun:test'

expect.extend({
  ...jestExtendedMatchers,
})

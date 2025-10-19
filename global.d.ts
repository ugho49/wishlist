/** biome-ignore-all lint/suspicious/noExplicitAny: vitest*/
import 'vitest'

import type CustomMatchers from 'jest-extended'

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining<T = any> extends CustomMatchers<T> {}
  interface ExpectStatic extends CustomMatchers<any> {}
}

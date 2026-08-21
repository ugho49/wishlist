/** biome-ignore-all lint/suspicious/noExplicitAny: bun:test matchers */
import type CustomMatchers from 'jest-extended'

declare module 'bun:test' {
  interface Matchers<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchers extends CustomMatchers<any> {}
}

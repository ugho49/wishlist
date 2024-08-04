const nxPreset = require('@nx/jest/preset').default;

/** @type {import('jest').Config} */
module.exports = {
  ...nxPreset,
  testTimeout: 20000,
  passWithNoTests: true,
  collectCoverage: true,
  coverageReporters: ['clover', 'json', 'lcov', 'text'],
  reporters: ['default', 'jest-junit'],
  setupFilesAfterEnv: ['jest-extended/all', 'jest-expect-message']
}

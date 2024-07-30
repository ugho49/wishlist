const nxPreset = require('@nx/jest/preset').default;

/** @type {import('jest').Config} */
module.exports = {
  ...nxPreset,
  testTimeout: 20000,
  passWithNoTests: true
}

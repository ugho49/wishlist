// Handle uncaught PostgreSQL connection errors that occur during test teardown
// These errors happen when Docker containers are stopped while connections are still open
// They don't affect test results but cause Vitest to report unhandled errors

process.on('uncaughtException', (error: Error) => {
  // Ignore PostgreSQL connection termination errors that occur during teardown
  if (
    error.message?.includes('terminating connection due to administrator command') ||
    error.message?.includes('57P01') // PostgreSQL error code for connection termination
  ) {
    // These are expected during Docker container shutdown
    return
  }

  // Re-throw other uncaught exceptions
  throw error
})

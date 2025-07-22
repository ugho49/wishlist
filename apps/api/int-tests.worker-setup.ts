import { Client } from 'pg'

// Create isolated database for this specific worker
const workerId = process.env.VITEST_WORKER_ID ?? '1'
const baseDatabaseName = process.env.DB_NAME
const workerDatabaseName = `${baseDatabaseName}-test-worker-${workerId}`

console.log(`Setting up database for worker ${workerId}: ${workerDatabaseName} ... `)

async function setupWorkerDatabase() {
  const adminClient = new Client({
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    user: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: 'postgres',
  })

  try {
    await adminClient.connect()

    // Drop database if it exists (cleanup from previous runs)
    await adminClient.query(`DROP DATABASE IF EXISTS "${workerDatabaseName}"`)

    // Create worker-specific database
    await adminClient.query(`CREATE DATABASE "${workerDatabaseName}"`)

    console.log(`Database ${workerDatabaseName} created successfully for worker ${workerId}`)
  } catch (error) {
    console.error(`Failed to create database ${workerDatabaseName}:`, error)
    throw error
  } finally {
    await adminClient.end()
  }

  // Set the worker-specific database name in environment
  process.env.DB_NAME = workerDatabaseName
}

// Execute setup immediately when this file is loaded
await setupWorkerDatabase()

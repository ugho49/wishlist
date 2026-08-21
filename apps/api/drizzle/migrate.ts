/** biome-ignore-all lint/style/noNonNullAssertion: Env variables are ok here */
import { join } from 'node:path'
import { createConsola } from 'consola'
import dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/bun-sql'
import { migrate } from 'drizzle-orm/bun-sql/migrator'

import { createSqlClient } from '../src/core/database/create-sql-client'

dotenv.config()

const consola = createConsola()

async function main() {
  consola.start('Running Drizzle migrations...')

  const client = createSqlClient({
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  })

  try {
    await client`SELECT 1`
  } catch (error) {
    consola.error('Failed to connect to the database', error)
    process.exit(1)
  }

  const db = drizzle(client)

  try {
    await migrate(db, { migrationsFolder: join(import.meta.dir, 'migrations') })
    consola.success('Migrations completed')
  } finally {
    await client.close()
  }
}

await main()

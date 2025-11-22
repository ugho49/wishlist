import type { INestApplication } from '@nestjs/common'
import type { TableAssertSortOptions } from './table-assert'

import { Logger } from '@nestjs/common'
import { DatabaseService } from '@wishlist/api/core'
import pg, { Client } from 'pg'
import * as request from 'supertest'
import { afterAll, beforeAll, beforeEach } from 'vitest'

import { createApp } from '../src/bootstrap'
import { Fixtures } from './fixtures'
import { TableAssert } from './table-assert'

export type RequestApp = InstanceType<(typeof request)['agent']>

export type SignedAs = 'BASE_USER' | 'ADMIN_USER'

const pgTypes = pg.types

pgTypes.setTypeParser(pgTypes.builtins.NUMERIC, value => parseFloat(value))
pgTypes.setTypeParser(pgTypes.builtins.DATE, value => new Date(value))

export function useTestApp() {
  let app: INestApplication
  let databaseService: DatabaseService
  let client: Client
  let logger: Logger
  let fixtures: Fixtures

  beforeAll(async () => {
    // Get worker ID from Vitest pool
    const workerId = process.env.VITEST_POOL_ID || '1'
    logger = new Logger(`UseTestApp [Worker ${workerId}]`)

    // Read ports from environment variables set by global setup
    const dbPort = process.env[`DOCKER_WORKER_${workerId}_DB_PORT_5432`]
    const mailPort = process.env[`DOCKER_WORKER_${workerId}_MAIL_PORT_1025`]
    const valkeyPort = process.env[`DOCKER_WORKER_${workerId}_VALKEY_PORT_6379`]

    if (!dbPort || !mailPort || !valkeyPort) {
      throw new Error(
        `Docker environment variables not found for worker ${workerId}. ` +
          `Expected: DOCKER_WORKER_${workerId}_DB_PORT_5432, DOCKER_WORKER_${workerId}_MAIL_PORT_1025, DOCKER_WORKER_${workerId}_VALKEY_PORT_6379`,
      )
    }

    logger.log(`Using Docker Compose environment - DB: ${dbPort}, Mail: ${mailPort}, Valkey: ${valkeyPort}`)

    // Configure environment variables for this worker
    process.env.DB_HOST = 'localhost'
    process.env.DB_PORT = dbPort
    process.env.DB_USERNAME = 'service'
    process.env.DB_PASSWORD = 'service'
    process.env.DB_NAME = 'wishlist-api'
    process.env.MAIL_HOST = 'localhost'
    process.env.MAIL_PORT = mailPort
    process.env.VALKEY_HOST = 'localhost'
    process.env.VALKEY_PORT = valkeyPort

    // Create and initialize the application
    app = await createApp()
    databaseService = app.get<DatabaseService>(DatabaseService)
    await app.init()

    // Connect to the database
    client = new Client({
      host: 'localhost',
      port: Number.parseInt(dbPort),
      user: 'service',
      password: 'service',
      database: 'wishlist-api',
      ssl: false,
    })

    await client.connect()
    await databaseService.runMigrations()

    fixtures = new Fixtures(client)
    logger.log('Test environment ready ✅')
  })

  beforeEach(async () => {
    await truncateDatabase()
  })

  afterAll(async () => {
    await client.end()
    await app.close()
    logger.log('Test environment cleaned up ✅')
  })

  async function truncateDatabase(): Promise<void> {
    logger.log('Truncating database ...')

    const allTables = await client.query(
      `SELECT schemaname, tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`,
    )
    const tables = allTables.rows.map(row => `${row.schemaname}.${row.tablename}`)

    for (const table of tables) {
      await client.query(`TRUNCATE TABLE ${table} CASCADE`)
    }

    logger.log(`Database truncated (${tables.length} tables) ✅`)
  }

  return {
    expectTable: (table: string, sortOptions?: TableAssertSortOptions) => new TableAssert(client, table, sortOptions),
    getFixtures: () => fixtures,
    getRequest: async (options?: { signedAs?: SignedAs }): Promise<RequestApp> => {
      const requestAppServer = request.agent(app.getHttpServer())
      const authPath = '/auth/login'
      let token = ''

      if (options?.signedAs === 'BASE_USER') {
        await fixtures.insertBaseUser()
        token = await requestAppServer
          .post(authPath)
          .send({ email: Fixtures.BASE_USER_EMAIL, password: Fixtures.DEFAULT_USER_PASSWORD })
          .then(res => res.body.access_token)
      }

      if (options?.signedAs === 'ADMIN_USER') {
        await fixtures.insertAdminUser()
        token = await requestAppServer
          .post(authPath)
          .send({ email: Fixtures.ADMIN_USER_EMAIL, password: Fixtures.DEFAULT_USER_PASSWORD })
          .then(res => res.body.access_token)
      }

      return token ? requestAppServer.auth(token, { type: 'bearer' }) : requestAppServer
    },
  }
}

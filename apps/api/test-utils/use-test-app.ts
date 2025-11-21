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
    // Get unique database name for this worker to enable parallel test execution
    const workerId = process.env.VITEST_POOL_ID || '1'
    const baseDatabaseName = process.env.DB_NAME || 'wishlist-api'
    const databaseName = `${baseDatabaseName}-worker-${workerId}`

    // Override the database name for this worker
    process.env.DB_NAME = databaseName

    logger = new Logger(`UseTestApp [Worker ${workerId}]`)
    logger.log(`Using database: ${databaseName}`)

    // Create a client connected to the default postgres database to create our test database
    const adminClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: Number.parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USERNAME || 'service',
      password: process.env.DB_PASSWORD || 'service',
      database: 'postgres',
      ssl: false,
    })

    await adminClient.connect()

    // Drop and recreate the worker-specific database
    await adminClient.query(`DROP DATABASE IF EXISTS "${databaseName}"`)
    await adminClient.query(`CREATE DATABASE "${databaseName}"`)
    await adminClient.end()

    logger.log(`Database ${databaseName} created ✅`)

    // Now connect to our newly created database
    app = await createApp()
    databaseService = app.get<DatabaseService>(DatabaseService)
    await app.init()

    client = new Client({
      host: databaseService.config.host,
      port: databaseService.config.port,
      user: databaseService.config.username,
      password: databaseService.config.password,
      database: databaseName,
      ssl: false,
    })

    await client.connect()
    await databaseService.runMigrations()

    fixtures = new Fixtures(client)
  })

  beforeEach(async () => {
    await truncateDatabase()
  })

  afterAll(async () => {
    const databaseName = client.database
    await client.end()
    await app.close()

    // Clean up the worker-specific database
    const adminClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: Number.parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USERNAME || 'service',
      password: process.env.DB_PASSWORD || 'service',
      database: 'postgres',
      ssl: false,
    })

    await adminClient.connect()
    await adminClient.query(`DROP DATABASE IF EXISTS "${databaseName}"`)
    await adminClient.end()

    logger.log(`Database ${databaseName} dropped ✅`)
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

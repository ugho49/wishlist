import type { INestApplication } from '@nestjs/common'
import type { AbstractStartedContainer, StartedDockerComposeEnvironment } from 'testcontainers'
import type { TableAssertSortOptions } from './table-assert'

import { join } from 'node:path'
import { Logger } from '@nestjs/common'
import { DatabaseService } from '@wishlist/api/core'
import pg, { Client } from 'pg'
import * as request from 'supertest'
import { DockerComposeEnvironment } from 'testcontainers'
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
  let dockerEnvironment: StartedDockerComposeEnvironment

  beforeAll(async () => {
    const workerId = process.env.VITEST_POOL_ID || '1'
    logger = new Logger(`UseTestApp [Worker ${workerId}]`)

    // Start a complete Docker Compose environment for this worker
    logger.log('Starting Docker Compose environment...')
    const rootFolder = process.cwd()
    const dockerFolder = join(rootFolder, 'docker')

    dockerEnvironment = await new DockerComposeEnvironment(rootFolder, [
      join(dockerFolder, 'docker-compose.yml'),
      join(dockerFolder, 'docker-compose.test.yml'),
    ]).up()

    // Extract mapped ports from containers
    const containers = dockerEnvironment.startedGenericContainers as Record<string, AbstractStartedContainer>

    const dbContainer = Object.values(containers).find(c => c.getName().includes('db'))
    const mailContainer = Object.values(containers).find(c => c.getName().includes('mail'))
    const valkeyContainer = Object.values(containers).find(c => c.getName().includes('valkey'))

    if (!dbContainer || !mailContainer || !valkeyContainer) {
      throw new Error('Required containers not found in Docker Compose environment')
    }

    const dbPort = dbContainer.getMappedPort(5432)
    const mailPort = mailContainer.getMappedPort(1025)
    const valkeyPort = valkeyContainer.getMappedPort(6379)

    logger.log(`Docker Compose started - DB: ${dbPort}, Mail: ${mailPort}, Valkey: ${valkeyPort}`)

    // Configure environment variables for this worker
    process.env.DB_HOST = 'localhost'
    process.env.DB_PORT = dbPort.toString()
    process.env.DB_USERNAME = 'service'
    process.env.DB_PASSWORD = 'service'
    process.env.DB_NAME = 'wishlist-api'
    process.env.MAIL_HOST = 'localhost'
    process.env.MAIL_PORT = mailPort.toString()
    process.env.VALKEY_HOST = 'localhost'
    process.env.VALKEY_PORT = valkeyPort.toString()

    // Create and initialize the application
    app = await createApp()
    databaseService = app.get<DatabaseService>(DatabaseService)
    await app.init()

    // Connect to the database
    client = new Client({
      host: 'localhost',
      port: dbPort,
      user: 'service',
      password: 'service',
      database: 'wishlist-api',
      ssl: false,
    })

    await client.connect()
    await databaseService.runMigrations()

    fixtures = new Fixtures(client)
    logger.log('Test environment ready ✅')
  }, 120000) // Increase timeout for Docker Compose startup

  beforeEach(async () => {
    await truncateDatabase()
  })

  afterAll(async () => {
    logger.log('Cleaning up test environment...')

    await client.end()
    await app.close()

    // Stop and clean up the Docker Compose environment
    await dockerEnvironment.down()
    await dockerEnvironment.stop()

    logger.log('Test environment cleaned up ✅')
  }, 60000) // Increase timeout for Docker Compose cleanup

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

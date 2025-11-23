import type { INestApplication } from '@nestjs/common'
import type { AbstractStartedContainer, StartedDockerComposeEnvironment } from 'testcontainers'
import type { TableAssertSortOptions } from './table-assert'

import { dirname, join } from 'node:path'
import { Logger } from '@nestjs/common'
import { DatabaseService } from '@wishlist/api/core'
import axios, { AxiosInstance } from 'axios'
import * as dotenv from 'dotenv'
import pg, { Client } from 'pg'
import * as request from 'supertest'
import { DockerComposeEnvironment } from 'testcontainers'
import { afterAll, beforeAll, beforeEach } from 'vitest'

import { createApp } from '../src/bootstrap'
import { Fixtures } from './fixtures'
import { MailsAssert } from './mail-assert'
import { TableAssert } from './table-assert'

export type RequestApp = InstanceType<(typeof request)['agent']>

export type SignedAs = 'BASE_USER' | 'ADMIN_USER'

const pgTypes = pg.types

pgTypes.setTypeParser(pgTypes.builtins.NUMERIC, value => parseFloat(value))
pgTypes.setTypeParser(pgTypes.builtins.DATE, value => new Date(value))

async function initDocker(workerId: string): Promise<StartedDockerComposeEnvironment> {
  const rootFolder = process.cwd()
  const dockerFolder = join(rootFolder, 'docker')
  const envPath = join(dirname(__dirname), '.env.test:int')

  console.log(`Setting up integration tests with Docker for worker ${workerId}`)

  const environment = await new DockerComposeEnvironment(rootFolder, [
    join(dockerFolder, 'docker-compose.yml'),
    join(dockerFolder, 'docker-compose.test.yml'),
  ]).up()

  // @ts-expect-error
  const containers = environment.startedGenericContainers as Record<string, AbstractStartedContainer>
  const configOutput = dotenv.config({ path: envPath })
  const newVars = new Map<string, string>()

  for (const container of Object.values(containers)) {
    const containerName = container.getName().split('-')[0]?.toUpperCase()

    // @ts-expect-error
    const boundedPorts = container.boundPorts as { ports: Map<number, number> }

    for (const [internal, external] of boundedPorts.ports) {
      const internalPort = internal.toString().split('/')[0]
      const variable = `DOCKER_${containerName}_PORT_${internalPort}`
      newVars.set(variable, external.toString())
    }
  }

  console.log(`new vars for worker ${workerId}`, { ...Object.fromEntries(newVars) })

  // Assign all Docker port variables to process.env
  for (const [key, value] of newVars) {
    process.env[key] = value
  }

  // Then process the .env.test:int file to replace any $ references
  for (const [key, value] of Object.entries(configOutput.parsed ?? {})) {
    if (value.startsWith('$')) {
      const variable = value.replace('$', '')

      if (!newVars.has(variable)) {
        throw new Error(`Variable ${variable} not found for worker ${workerId}`)
      }

      process.env[key] = newVars.get(variable)
    }
  }

  return environment
}

export function useTestApp() {
  let app: INestApplication
  let databaseService: DatabaseService
  let client: Client
  let logger: Logger
  let fixtures: Fixtures
  let needToClearMails = false
  let environment: StartedDockerComposeEnvironment
  let mailHttp: AxiosInstance
  let clientClosed = false

  beforeAll(async () => {
    const workerId =
      process.env.VITEST_WORKER_ID ??
      process.env.VITEST_POOL_ID ??
      `worker-${Date.now()}-${Math.random().toString(36).substring(7)}`

    environment = await initDocker(workerId)

    app = await createApp()
    databaseService = app.get<DatabaseService>(DatabaseService)
    await app.init()
    logger = new Logger(`UseTestApp-${workerId}`)

    client = new Client({
      host: databaseService.config.host,
      port: databaseService.config.port,
      user: databaseService.config.username,
      password: databaseService.config.password,
      database: databaseService.config.database,
      ssl: false,
    })

    const mailPort = process.env.DOCKER_MAIL_PORT_1080
    if (!mailPort) throw new Error(`DOCKER_MAIL_PORT_1080 is not set for worker ${workerId}`)
    mailHttp = axios.create({
      baseURL: `http://localhost:${mailPort}`,
    })

    await client.connect()
    await dropDatabase()
    await Promise.all([databaseService.runMigrations(), clearMails()])

    fixtures = new Fixtures(client)
  })

  beforeEach(async () => {
    const promises = [truncateDatabase()]
    if (needToClearMails) promises.push(clearMails())
    await Promise.all(promises)
    needToClearMails = false
  })

  afterAll(async () => {
    // Close app first to properly close all database connections from Drizzle pool
    try {
      if (app) {
        await app.close()
      }
    } catch {
      // Ignore errors during app close as connections may already be closed
    }

    // Then close our direct client connection
    try {
      if (client && !clientClosed) {
        // Wait longer to ensure all queries are finished, especially in parallel execution
        await new Promise(resolve => setTimeout(resolve, 500))
        await client.end()
        clientClosed = true
      }
    } catch {
      // Ignore errors - connection may already be closed
      clientClosed = true
    }

    // Finally stop Docker - wait a bit more to ensure all connections are closed
    try {
      // Give time for all database operations to complete
      await new Promise(resolve => setTimeout(resolve, 200))
      console.log('Stopping Docker...')
      if (environment) {
        await environment.down()
        await environment.stop()
      }
      console.log('Docker stopped')
    } catch (error) {
      console.error('Error stopping Docker', error)
    }
  })

  async function dropDatabase(): Promise<void> {
    logger.log('Dropping database...')

    const allTables = await client.query(
      `SELECT schemaname, tablename FROM pg_catalog.pg_tables WHERE schemaname IN ('drizzle', 'public')`,
    )
    const tables = allTables.rows.map(row => `${row.schemaname}.${row.tablename}`)

    for (const table of tables) {
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`)
    }

    logger.log(`Database dropped (${tables.length} tables) ✅`)
  }

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

  async function clearMails(): Promise<void> {
    logger.log('Clearing mails...')
    await new Promise(resolve => setTimeout(resolve, 100))
    await mailHttp.delete('/email/all')
    logger.log('Mails cleared ✅')
  }

  return {
    expectTable: (table: string, sortOptions?: TableAssertSortOptions) => new TableAssert(client, table, sortOptions),
    expectMail: () => {
      needToClearMails = true
      return new MailsAssert(mailHttp)
    },
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

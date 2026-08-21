import type { INestApplication } from '@nestjs/common'
import type { SQL } from 'bun'
import type { TableAssertSortOptions } from './table-assert'

import { Logger } from '@nestjs/common'
import { DatabaseService } from '@wishlist/api/core'
import axios, { type AxiosInstance } from 'axios'
import request from 'supertest'

import { createApp } from '../src/bootstrap'
import { Fixtures } from './fixtures'
import { MailsAssert } from './mail-assert'
import { TableAssert } from './table-assert'
import { afterAll, beforeAll, beforeEach } from 'bun:test'

export type RequestApp = InstanceType<(typeof request)['agent']>

export type SignedAs = 'BASE_USER' | 'ADMIN_USER'

export function useTestApp() {
  let app: INestApplication
  let sql: SQL
  let logger: Logger
  let fixtures: Fixtures
  let needToClearMails = false
  let http: AxiosInstance

  beforeAll(async () => {
    app = await createApp()
    const databaseService = app.get<DatabaseService>(DatabaseService)
    await app.init()
    logger = new Logger('UseTestApp')

    sql = databaseService.sql
    http = axios.create({
      baseURL: `http://localhost:${process.env['DOCKER_MAIL_PORT_1080']}`,
    })
    await clearMails()

    fixtures = new Fixtures(sql)
  })

  beforeEach(async () => {
    const promises = [truncateDatabase()]
    if (needToClearMails) promises.push(clearMails())
    await Promise.all(promises)
    needToClearMails = false
  })

  afterAll(async () => {
    await app.close()
  })

  async function truncateDatabase(): Promise<void> {
    logger.log('Truncating database ...')

    const allTables = await sql<{ schemaname: string; tablename: string }[]>`
      SELECT schemaname, tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'
    `
    const tables = allTables.map(row => `${row.schemaname}.${row.tablename}`)

    for (const table of tables) {
      await sql.unsafe(`TRUNCATE TABLE ${table} CASCADE`)
    }

    logger.log(`Database truncated (${tables.length} tables) ✅`)
  }

  async function clearMails(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100))
    await http.delete('/email/all')
    logger.log('Mails cleared ✅')
  }

  return {
    expectTable: (table: string, sortOptions?: TableAssertSortOptions) => new TableAssert(sql, table, sortOptions),
    expectMail: () => {
      needToClearMails = true
      return new MailsAssert(http)
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

import { afterAll, beforeAll, beforeEach } from '@jest/globals'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { DataSource } from 'typeorm'

import { createApp } from '../../bootstrap'
import { Fixtures } from './fixtures'
import { TableAssert, TableAssertSortOptions } from './table-assert'

export type RequestApp = InstanceType<(typeof request)['agent']>

export type SignedAs = 'BASE_USER' | 'ADMIN_USER'

export function useTestApp() {
  let app: INestApplication
  let datasource: DataSource

  beforeAll(async () => {
    app = await createApp()
    datasource = app.get<DataSource>(DataSource)
    await app.init()
  })

  beforeEach(async () => {
    await datasource.dropDatabase()
    await datasource.runMigrations()
  })

  afterAll(async () => {
    await app.close()
  })

  return {
    expectTable: (table: string, sortOptions?: TableAssertSortOptions) =>
      new TableAssert(datasource, table, sortOptions),
    getFixtures: () => Fixtures.create(datasource),
    getRequest: async (options?: { signedAs?: SignedAs }): Promise<RequestApp> => {
      const requestAppServer = request.agent(app.getHttpServer())
      const fixtures = Fixtures.create(datasource)
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

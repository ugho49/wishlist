import { afterAll, beforeAll, beforeEach } from '@jest/globals'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { DataSource } from 'typeorm'

import { createApp } from '../../bootstrap'
import { ADMIN_USER_EMAIL, BASE_USER_EMAIL, DEFAULT_USER_PASSWORD, insertAdminUser, insertBaseUser } from './fixtures'
import { TableAssert } from './table-assert'

export type RequestApp = InstanceType<(typeof request)['agent']>

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
    getDatasource: () => datasource,
    expectTable: (table: string) => new TableAssert(datasource, table),
    getRequest: async (options?: { signedAs?: 'BASE_USER' | 'ADMIN_USER' }): Promise<RequestApp> => {
      const requestAppServer = request.agent(app.getHttpServer())
      const authPath = '/auth/login'
      let token = ''

      if (options?.signedAs === 'BASE_USER') {
        await insertBaseUser(datasource)
        token = await requestAppServer
          .post(authPath)
          .send({ email: BASE_USER_EMAIL, password: DEFAULT_USER_PASSWORD })
          .then(res => res.body.access_token)
      }

      if (options?.signedAs === 'ADMIN_USER') {
        await insertAdminUser(datasource)
        token = await requestAppServer
          .post(authPath)
          .send({ email: ADMIN_USER_EMAIL, password: DEFAULT_USER_PASSWORD })
          .then(res => res.body.access_token)
      }

      return token ? requestAppServer.auth(token, { type: 'bearer' }) : requestAppServer
    },
  }
}

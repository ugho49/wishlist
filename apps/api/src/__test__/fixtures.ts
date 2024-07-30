import { afterAll, beforeAll, beforeEach } from '@jest/globals'
import { INestApplication } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { createApp } from '../bootstrap'
import { TableAssert } from './table-assert'

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
    getHttpServer: () => app.getHttpServer(),
    runQuery: (query: string, parameters?: unknown[]) => datasource.query(query, parameters),
    expectTable: (table: string) => new TableAssert(datasource, table),
  }
}

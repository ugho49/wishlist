import type { Database } from './database.types'

import { Inject, Injectable } from '@nestjs/common'
import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'

import { DatabaseConfig } from './database.config'
import { DATABASE_CONFIG_TOKEN } from './database.module-definitions'

@Injectable()
export class DatabaseService {
  public readonly db: Kysely<Database>

  constructor(@Inject(DATABASE_CONFIG_TOKEN) config: DatabaseConfig) {
    const dialect = new PostgresDialect({
      pool: new Pool({
        database: config.database,
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
      }),
    })

    this.db = new Kysely<Database>({
      dialect,
    })
  }
}

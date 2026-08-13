import { Inject, Injectable, Logger } from '@nestjs/common'
import { relations as drizzleRelations, schema as drizzleSchema } from '@wishlist/api-drizzle'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'

import { DatabaseConfig } from './database.config'
import { DATABASE_CONFIG_TOKEN } from './database.module-definitions'

export const mergedSchema = { ...drizzleSchema, ...drizzleRelations }

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name)

  public readonly schema: typeof mergedSchema = mergedSchema
  public readonly db: NodePgDatabase<typeof mergedSchema>

  constructor(@Inject(DATABASE_CONFIG_TOKEN) public readonly config: DatabaseConfig) {
    this.db = drizzle({
      connection: {
        host: this.config.host,
        port: this.config.port,
        user: this.config.username,
        password: this.config.password,
        database: this.config.database,
        ssl: false,
      },
      schema: mergedSchema,
      casing: 'snake_case',
      logger: this.config.verbose
        ? { logQuery: (query, params) => this.logger.log('SQL Query', { query, params }) }
        : false,
    })
  }

  async ping(): Promise<void> {
    try {
      await this.db.execute('SELECT 1')
    } catch {
      throw new Error(`Database is not reachable on ${this.config.host}:${this.config.port} (${this.config.database})`)
    }
  }
}

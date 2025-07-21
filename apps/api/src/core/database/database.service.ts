import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { relations as drizzleRelations, schema as drizzleSchema } from '@wishlist/api-drizzle'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'

import { DatabaseConfig } from './database.config'
import { DATABASE_CONFIG_TOKEN } from './database.module-definitions'

export const mergedSchema = { ...drizzleSchema, ...drizzleRelations }

@Injectable()
export class DatabaseService implements OnModuleInit {
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

  async onModuleInit() {
    if (this.config.runMigrations) {
      await this.runMigrations()
    }
  }

  async runMigrations(): Promise<void> {
    const migrationsFolder = this.config.migrationsFolder
    this.logger.log('Running migrations ...', { migrationsFolder })

    await migrate(this.db, {
      migrationsFolder,
    })

    this.logger.log('Migrations completed ✅')
  }
}

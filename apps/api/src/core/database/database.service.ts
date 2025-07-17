import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { relations as drizzleRelations, schema as drizzleSchema } from '@wishlist/api-drizzle'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pg, { Client } from 'pg'

import { DatabaseConfig } from './database.config'
import { DATABASE_CONFIG_TOKEN } from './database.module-definitions'

export const mergedSchema = { ...drizzleSchema, ...drizzleRelations }
const pgTypes = pg.types

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name)

  public readonly schema: typeof mergedSchema = mergedSchema
  public readonly db: NodePgDatabase<typeof mergedSchema>
  public readonly client: Client

  constructor(@Inject(DATABASE_CONFIG_TOKEN) public readonly config: DatabaseConfig) {
    this.client = new Client({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database,
      ssl: false,
    })

    pgTypes.setTypeParser(pgTypes.builtins.NUMERIC, value => parseFloat(value))
    pgTypes.setTypeParser(pgTypes.builtins.DATE, value => new Date(value))

    this.db = drizzle({
      client: this.client,
      schema: mergedSchema,
      casing: 'snake_case',
      logger: this.config.verbose
        ? { logQuery: (query, params) => this.logger.log('SQL Query', { query, params }) }
        : false,
    })
  }

  async onModuleInit() {
    await this.client.connect()

    if (this.config.runMigrations) {
      await this.runMigrations()
    }
  }

  async onModuleDestroy() {
    await this.client.end()
  }

  async dropDatabase(): Promise<void> {
    this.logger.log('Dropping database ...')

    const allTables = await this.db.execute(
      `SELECT schemaname, tablename FROM pg_catalog.pg_tables WHERE schemaname IN ('drizzle', 'public')`,
    )
    const tables = allTables.rows.map(row => `${row.schemaname}.${row.tablename}`)

    for (const table of tables) {
      await this.db.execute(`DROP TABLE IF EXISTS ${table} CASCADE`)
    }

    this.logger.log(`Database dropped (${tables.length} tables) ✅`)
  }

  async truncateDatabase(): Promise<void> {
    this.logger.log('Truncating database ...')

    const allTables = await this.db.execute(
      `SELECT schemaname, tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`,
    )
    const tables = allTables.rows.map(row => `${row.schemaname}.${row.tablename}`)

    for (const table of tables) {
      await this.db.execute(`TRUNCATE TABLE ${table} CASCADE`)
    }

    this.logger.log(`Database truncated (${tables.length} tables) ✅`)
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

import type { SQL } from 'bun';
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql';

import { Inject, Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { schema } from '@wishlist/api-drizzle';
import { drizzle } from 'drizzle-orm/bun-sql';
import { EnhancedQueryLogger } from 'drizzle-query-logger';

import { createSqlClient } from './create-sql-client';
import { DatabaseConfig } from './database.config';
import { DATABASE_CONFIG_TOKEN } from './database.module-definitions';

export type DrizzleDatabase = BunSQLDatabase<typeof schema>;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly sql: SQL;

  public readonly schema: typeof schema = schema;
  public readonly db: DrizzleDatabase;

  constructor(@Inject(DATABASE_CONFIG_TOKEN) public readonly config: DatabaseConfig) {
    const sql = createSqlClient(this.config);

    this.db = drizzle(sql, {
      schema,
      casing: 'snake_case',
      logger: this.config.verbose ? new EnhancedQueryLogger() : false,
    });
    this.sql = sql;
  }

  async ping(): Promise<void> {
    try {
      await this.sql`SELECT 1`;
    } catch {
      throw new Error(`Database is not reachable on ${this.config.host}:${this.config.port} (${this.config.database})`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.debug('Closing database connection...');
    await this.sql.close();
    this.logger.debug('Database connection closed');
  }
}

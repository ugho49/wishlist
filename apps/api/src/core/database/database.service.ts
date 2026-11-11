import type { SQL } from 'bun';
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql';

import { schema } from '@wishlist/api-drizzle';
import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';
import { drizzle } from 'drizzle-orm/bun-sql';
import { EnhancedQueryLogger } from 'drizzle-query-logger';

import { createSqlClient } from './create-sql-client';
import { DatabaseConfig } from './database.config';

export type DrizzleDatabase = BunSQLDatabase<typeof schema>;

@Injectable()
export class DatabaseService {
  private readonly logger = getLogger(DatabaseService.name);
  public readonly sql: SQL;

  public readonly schema: typeof schema = schema;
  public readonly db: DrizzleDatabase;

  constructor(public readonly config: DatabaseConfig) {
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

  async [Symbol.asyncDispose](): Promise<void> {
    this.logger.debug('Closing database connection...');
    await this.sql.close();
    this.logger.debug('Database connection closed');
  }
}

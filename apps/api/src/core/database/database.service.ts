import type { SQL } from 'bun';
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql';

import { schema } from '@wishlist/api-drizzle';
import { Injectable } from '@znight/core';
import { drizzle } from 'drizzle-orm/bun-sql';
import { EnhancedQueryLogger } from 'drizzle-query-logger';

import { DatabaseConfig } from './database.config';

export type DrizzleDatabase = BunSQLDatabase<typeof schema>;

@Injectable()
export class DatabaseService {
  public readonly schema: typeof schema = schema;
  public readonly db: DrizzleDatabase;

  constructor(
    public readonly config: DatabaseConfig,
    public readonly sql: SQL,
  ) {
    this.db = drizzle(sql, {
      schema,
      casing: 'snake_case',
      logger: this.config.verbose ? new EnhancedQueryLogger() : false,
    });
  }

  async ping(): Promise<void> {
    try {
      await this.sql`SELECT 1`;
    } catch {
      throw new Error(`Database is not reachable on ${this.config.host}:${this.config.port} (${this.config.database})`);
    }
  }
}

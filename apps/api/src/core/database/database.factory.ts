import type { BunSQLDatabase } from 'drizzle-orm/bun-sql';

import { schema } from '@wishlist/api-drizzle';
import { Factory, Provides } from '@znight/core';
import { SQL } from 'bun';
import { drizzle } from 'drizzle-orm/bun-sql';
import { EnhancedQueryLogger } from 'drizzle-query-logger';

import { DatabaseConfig } from './database.config';

export type DrizzleDatabase = BunSQLDatabase<typeof schema>;

@Factory()
export class DatabaseFactory {
  /** The Postgres connection pool, closed by the container on shutdown. */
  @Provides({ dispose: 'close' })
  sqlClient(config: DatabaseConfig): SQL {
    return new SQL({
      adapter: 'postgres',
      hostname: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
    });
  }

  /** The Drizzle database on top of the pool (the pool is closed by `sqlClient`'s disposal). */
  @Provides()
  database(sql: SQL, config: DatabaseConfig): DrizzleDatabase {
    return drizzle(sql, {
      schema,
      casing: 'snake_case',
      logger: config.verbose ? new EnhancedQueryLogger() : false,
    });
  }
}

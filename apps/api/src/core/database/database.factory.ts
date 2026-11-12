import { Factory, Provides } from '@znight/core';
import { SQL } from 'bun';

import { DatabaseConfig } from './database.config';

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
}

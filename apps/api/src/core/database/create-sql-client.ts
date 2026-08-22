import type { DatabaseConfig } from './database.config';

import { SQL } from 'bun';

export function createSqlClient(
  config: Pick<DatabaseConfig, 'host' | 'port' | 'username' | 'password' | 'database'>,
): SQL {
  return new SQL({
    adapter: 'postgres',
    hostname: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
  });
}

import { Config, Env, Secret } from '@znight/config';

/** PostgreSQL connection (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_VERBOSE). */
@Config('db')
export class DatabaseConfig {
  host!: string;
  port = 5432;
  username!: string;
  @Secret() password!: string;
  @Env('DB_NAME') database!: string;
  verbose = false;
}

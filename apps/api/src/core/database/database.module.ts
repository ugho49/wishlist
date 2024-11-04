import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DATABASE, DatabaseSchema } from '@wishlist/common-database'
import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

import { DatabaseService } from './database.service'
import migrations from './migrations'

const getPgConfig = (config: ConfigService) => ({
  host: config.getOrThrow<string>('DB_HOST'),
  port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
  username: config.getOrThrow<string>('DB_USERNAME'),
  password: config.getOrThrow<string>('DB_PASSWORD'),
  database: config.getOrThrow<string>('DB_NAME'),
  verboseLogging: config.get<string>('DB_VERBOSE', 'false') === 'true',
})

/**
 * @deprecated: in favor of kysely
 */
const typeOrmModule = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const pgConfig = getPgConfig(config)

    return {
      type: 'postgres',
      host: pgConfig.host,
      port: pgConfig.port,
      username: pgConfig.username,
      password: pgConfig.password,
      database: pgConfig.database,
      namingStrategy: new SnakeNamingStrategy(),
      autoLoadEntities: true,
      synchronize: false, // Setting synchronize: true shouldn't be used in production - otherwise you can lose production data.
      migrationsTableName: 'typeorm_migrations',
      migrationsRun: true,
      migrations,
      logging: pgConfig.verboseLogging,
      // dropSchema: true, // ⚠️⚠️ DEV MODE ONLY ⚠️⚠️ Uncomment this if you want to drop all database
    }
  },
})

@Global()
@Module({
  imports: [typeOrmModule],
  providers: [
    DatabaseService,
    {
      provide: DATABASE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const pgConfig = getPgConfig(config)

        const dialect = new PostgresDialect({
          pool: new Pool({
            database: pgConfig.database,
            host: pgConfig.host,
            user: pgConfig.username,
            password: pgConfig.password,
            port: pgConfig.port,
            max: 10,
          }),
        })

        // TODO: migrations: using Migrator

        return new Kysely<DatabaseSchema>({
          dialect,
          // TODO: in case of verbose, log all queries with parameters
        })
      },
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}

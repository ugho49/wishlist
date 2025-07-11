import { DrizzlePGConfig, DrizzlePGModule } from '@knaadh/nestjs-drizzle-pg'
import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

import * as drizzleSchema from '../../../drizzle/schema'
import { DRIZZLE_DB } from './database.constant'
import { DatabaseService } from './database.service'

/**
 * @deprecated Use DrizzlePGModule instead
 */
const typeOrmModule = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get<string>('DB_HOST', ''),
    port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
    username: config.get<string>('DB_USERNAME', ''),
    password: config.get<string>('DB_PASSWORD', ''),
    database: config.get<string>('DB_NAME', ''),
    namingStrategy: new SnakeNamingStrategy(),
    autoLoadEntities: true,
    synchronize: false, // Setting synchronize: true shouldn't be used in production - otherwise you can lose production data.
    migrationsRun: false,
    logging: config.get<string>('DB_VERBOSE', 'false') === 'true',
    // dropSchema: true, // ⚠️⚠️ DEV MODE ONLY ⚠️⚠️ Uncomment this if you want to drop all database
  }),
})

@Global()
@Module({
  imports: [
    typeOrmModule,
    DrizzlePGModule.registerAsync({
      inject: [ConfigService],
      tag: DRIZZLE_DB,
      useFactory: (config: ConfigService): DrizzlePGConfig => ({
        pg: {
          connection: 'client',
          config: {
            user: config.get<string>('DB_USERNAME', ''),
            password: config.get<string>('DB_PASSWORD', ''),
            database: config.get<string>('DB_NAME', ''),
            host: config.get<string>('DB_HOST', ''),
            port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
            ssl: false,
          },
        },
        config: { schema: { ...drizzleSchema }, casing: 'snake_case' },
      }),
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}

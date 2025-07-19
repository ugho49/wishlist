import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

import { ConfigurableDatabaseModule } from './database.module-definitions'
import { DatabaseService } from './database.service'
import { TransactionManager } from './transaction-manager'

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
    logging: false,
    // dropSchema: true, // ⚠️⚠️ DEV MODE ONLY ⚠️⚠️ Uncomment this if you want to drop all database
  }),
})

@Global()
@Module({
  imports: [typeOrmModule],
  providers: [DatabaseService, TransactionManager],
  exports: [DatabaseService, TransactionManager],
})
export class DatabaseModule extends ConfigurableDatabaseModule {}

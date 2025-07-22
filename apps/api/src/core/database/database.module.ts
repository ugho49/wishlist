import { Global, Module } from '@nestjs/common'

import { ConfigurableDatabaseModule } from './database.module-definitions'
import { DatabaseService } from './database.service'
import { TransactionManager } from './transaction-manager'

@Global()
@Module({
  providers: [DatabaseService, TransactionManager],
  exports: [DatabaseService, TransactionManager],
})
export class DatabaseModule extends ConfigurableDatabaseModule {}

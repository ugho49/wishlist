import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { CoreModule } from './core/core.module.js'
import { DomainModule } from './domain/domain.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
    CoreModule,
    DomainModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CqrsModule } from '@nestjs/cqrs'

import { CoreModule } from './core/core.module'
import { DomainModule } from './domain/domain.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
    CqrsModule.forRoot(),
    CoreModule,
    DomainModule,
  ],
})
export class AppModule {}

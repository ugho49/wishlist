import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CqrsModule } from '@nestjs/cqrs'
import { LoggerModule } from 'pino-nestjs'

import { AttendeeModule } from './attendee/attendee.module'
import { AuthModule } from './auth/auth.module'
import { CoreModule } from './core'
import { EventModule } from './event/event.module'
import { pinoLoggerConfig } from './helpers'
import { ItemModule } from './item'
import { RepositoriesModule } from './repositories'
import { SecretSantaModule } from './secret-santa'
import { UserModule } from './user'
import { WishlistModule } from './wishlist'

@Module({
  imports: [
    LoggerModule.forRoot(pinoLoggerConfig('wishlist-api')),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
    CqrsModule.forRoot(),
    CoreModule,
    RepositoriesModule,
    AuthModule,
    UserModule,
    WishlistModule,
    ItemModule,
    EventModule,
    AttendeeModule,
    SecretSantaModule,
  ],
})
export class AppModule {}

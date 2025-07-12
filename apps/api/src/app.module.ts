import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CqrsModule } from '@nestjs/cqrs'
import { LoggerModule } from 'pino-nestjs'

import { AttendeeModule } from './attendee/attendee.module'
import { AuthModule } from './auth/auth.module'
import { CoreModule } from './core/core.module'
import { EventModule } from './event/event.module'
import { pinoLoggerConfig } from './helpers'
import { ItemModule } from './item/item.module'
import { RepositoriesModule } from './repositories/repositories.module'
import { SecretSantaModule } from './secret-santa/secret-santa.module'
import { UserModule } from './user/user.module'
import { WishlistModule } from './wishlist/wishlist.module'

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

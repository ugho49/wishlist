import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerModule } from 'pino-nestjs';

import { AuthModule } from './auth/infrastructure/auth.module';
import { CoreModule } from './core/core.module';
import { GraphQLModule } from './core/graphql/graphql.module';
import { EventModule } from './event/infrastructure/event.module';
import { pinoLoggerConfig } from './helpers';
import { ItemModule } from './item/infrastructure/item.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { SecretSantaModule } from './secret-santa/infrastructure/secret-santa.module';
import { UserModule } from './user/infrastructure/user.module';
import { WishlistModule } from './wishlist/infrastructure/wishlist.module';

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
    SecretSantaModule,
    // GraphQLModule must be AFTER all domain modules it depends on
    GraphQLModule,
  ],
})
export class AppModule {}

import { join } from 'path'

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER } from '@nestjs/core'
import { CqrsModule } from '@nestjs/cqrs'
import { GraphQLModule } from '@nestjs/graphql'
import { LoggerModule } from 'pino-nestjs'

import { AuthModule } from './auth/infrastructure/auth.module'
import { CoreModule } from './core'
import { GraphqlExceptionFilter } from './core/graphql/graphql-exception.filter'
import { EventModule } from './event'
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
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/api/schema.gql'),
      sortSchema: true,
      introspection: true,
      csrfPrevention: false,
      formatError: error => {
        // Remove stack traces in production
        const isDevelopment = process.env['NODE_ENV'] !== 'production'
        return {
          message: error.message,
          extensions: {
            code: error.extensions?.code,
            statusCode: error.extensions?.statusCode,
            ...(isDevelopment && { stacktrace: error.extensions?.stacktrace }),
          },
        }
      },
    }),
    CoreModule,
    RepositoriesModule,
    AuthModule,
    UserModule,
    WishlistModule,
    ItemModule,
    EventModule,
    SecretSantaModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GraphqlExceptionFilter,
    },
  ],
})
export class AppModule {}

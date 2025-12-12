import type { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server'

import { join } from 'node:path'
import { ApolloServerErrorCode } from '@apollo/server/errors'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { HttpException, Logger, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CqrsModule } from '@nestjs/cqrs'
import { GraphQLModule } from '@nestjs/graphql'
import { GraphQLFormattedError, print } from 'graphql'
import { LoggerModule } from 'pino-nestjs'

import { AuthModule } from './auth/infrastructure/auth.module'
import { CoreModule } from './core'
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
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (): ApolloDriverConfig => {
        const logger = new Logger(GraphQLModule.name)

        // Apollo Server plugin for logging
        const loggingPlugin: ApolloServerPlugin = {
          // biome-ignore lint/suspicious/noExplicitAny: Apollo plugin context type
          requestDidStart(): Promise<GraphQLRequestListener<any>> {
            return Promise.resolve({
              didResolveOperation(requestContext) {
                const { request, operation } = requestContext
                const operationType = operation?.operation || 'unknown'
                const operationName = request.operationName || 'anonymous'

                // Convert the GraphQL document to a string
                const query = operation ? print(operation) : request.query || 'unknown'

                logger.log(`Executing GraphQL ${operationType}`, {
                  query,
                  operationType,
                  operationName,
                  variables: request.variables,
                })

                return Promise.resolve()
              },
              willSendResponse(requestContext) {
                const { response, operation, request } = requestContext
                const operationType = operation?.operation || 'unknown'
                const operationName = request.operationName || 'anonymous'

                // Log errors if any
                if (response.body.kind === 'single' && response.body.singleResult.errors) {
                  const errors = response.body.singleResult.errors
                  const query = operation ? print(operation) : request.query || 'unknown'

                  logger.error(`GraphQL ${operationType} errors`, {
                    query,
                    operationType,
                    operationName,
                    errors: errors.map(e => ({ code: e.extensions?.code, message: e.message })),
                  })
                }

                return Promise.resolve()
              },
            })
          },
        }

        return {
          autoSchemaFile: join(process.cwd(), 'apps/api/schema.graphql'),
          sortSchema: true,
          introspection: process.env.NODE_ENV !== 'production',
          graphiql: process.env.NODE_ENV !== 'production',
          context: ({ req }: { req: Request }) => ({ req }),
          plugins: [loggingPlugin],
          formatError: (gqlError: GraphQLFormattedError, error) => {
            // Extract the original error
            // biome-ignore lint/suspicious/noExplicitAny: GraphQL error unwrapping
            const originalError = (error as any)?.originalError || error
            const formattedError: GraphQLFormattedError = {
              ...gqlError,
              locations: undefined,
              extensions: { ...gqlError.extensions, stacktrace: undefined },
            }

            // Return a different error message
            if (formattedError.extensions?.code === ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED) {
              return {
                ...formattedError,
                message: "Your query doesn't match the schema. Try double-checking it!",
              }
            }

            // If it's a NestJS HttpException, preserve its message and details
            if (originalError instanceof HttpException) {
              return {
                ...formattedError,
                message: originalError.message,
                extensions: { code: formattedError.extensions?.code },
              }
            }

            return formattedError
          },
        }
      },
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
  ],
})
export class AppModule {}

import { join } from 'node:path'
import { ApolloServerErrorCode } from '@apollo/server/errors'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { HttpException, Module } from '@nestjs/common'
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql'
import { ICurrentUser } from '@wishlist/common'
import { GraphQLFormattedError } from 'graphql'

import { EventModule } from '../../event'
import { EventDataLoaderFactory } from '../../event/infrastructure/event.dataloader'
import { EventAttendeeDataLoaderFactory } from '../../event/infrastructure/event-attendee.dataloader'
import { UserModule } from '../../user'
import { UserDataLoaderFactory } from '../../user/infrastructure/user.dataloader'
import { WishlistModule } from '../../wishlist'
import { WishlistDataLoaderFactory } from '../../wishlist/infrastructure/wishlist.dataloader'
import { GraphQLContextEnum } from './context.enum'
import { GraphQLLoggerPlugin } from './logger.plugin'

@Module({
  imports: [
    NestGraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [UserModule, WishlistModule, EventModule],
      inject: [
        UserDataLoaderFactory,
        WishlistDataLoaderFactory,
        EventDataLoaderFactory,
        EventAttendeeDataLoaderFactory,
      ],
      useFactory: (
        userDataLoaderFactory: UserDataLoaderFactory,
        wishlistDataLoaderFactory: WishlistDataLoaderFactory,
        eventDataLoaderFactory: EventDataLoaderFactory,
        eventAttendeeDataLoaderFactory: EventAttendeeDataLoaderFactory,
      ): ApolloDriverConfig => ({
        autoSchemaFile: join(process.cwd(), 'schema.graphql'),
        sortSchema: true,
        introspection: process.env.NODE_ENV !== 'production',
        graphiql: process.env.NODE_ENV !== 'production',
        context: ({ req }: { req: Request & { user?: ICurrentUser } }) => ({
          req,
          [GraphQLContextEnum.USER_DATA_LOADER]: userDataLoaderFactory.createLoader(),
          [GraphQLContextEnum.WISHLIST_DATA_LOADER]: wishlistDataLoaderFactory.createLoader(() => req.user),
          [GraphQLContextEnum.EVENT_DATA_LOADER]: eventDataLoaderFactory.createLoader(() => req.user),
          [GraphQLContextEnum.EVENT_ATTENDEE_DATA_LOADER]: eventAttendeeDataLoaderFactory.createLoader(),
        }),
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
            const originalErrorMessageFormatted = (formattedError.extensions?.originalError as Error)?.message
            const messages = []

            if (Array.isArray(originalErrorMessageFormatted)) {
              messages.push(...originalErrorMessageFormatted)
            }

            return {
              ...formattedError,
              message: originalError.message,
              extensions: {
                code: formattedError.extensions?.code,
                details: messages.length > 0 ? messages : undefined,
              },
            }
          }

          return formattedError
        },
      }),
    }),
  ],
  providers: [GraphQLLoggerPlugin],
})
export class GraphQLModule {}

import type { Request } from 'express'

import { join } from 'path'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'

import { AuthGraphQLModule } from '../auth/infrastructure/graphql/auth-graphql.module'
import { EventGraphQLModule } from '../event/infrastructure/graphql/event-graphql.module'
import { ItemGraphQLModule } from '../item/infrastructure/graphql/item-graphql.module'
import { SecretSantaGraphQLModule } from '../secret-santa/infrastructure/graphql/secret-santa-graphql.module'
import { UserGraphQLModule } from '../user/infrastructure/graphql/user-graphql.module'
import { WishlistGraphQLModule } from '../wishlist/infrastructure/graphql/wishlist-graphql.module'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/api/schema.graphql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    AuthGraphQLModule,
    UserGraphQLModule,
    EventGraphQLModule,
    WishlistGraphQLModule,
    ItemGraphQLModule,
    SecretSantaGraphQLModule,
  ],
})
export class GraphqlModule {}

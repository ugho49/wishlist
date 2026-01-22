import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs'
import { Module } from '@nestjs/common'
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql'

import { DataLoaderModule } from '../../dataloader/dataloader.module'
import { DataLoaderService } from '../../dataloader/dataloader.service'
import { GraphQLContext } from './graphql.context'
import { useLoggingPlugin } from './graphql.plugin'

@Module({
  imports: [
    NestGraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      imports: [DataLoaderModule],
      inject: [DataLoaderService],
      useFactory: (dataLoaderService: DataLoaderService) => ({
        autoSchemaFile: 'schema.graphql',
        plugins: [useLoggingPlugin()],
        graphiql: true,
        context: ({ req }: Omit<GraphQLContext, 'loaders'>): GraphQLContext => ({
          req,
          loaders: dataLoaderService.createLoaders(() => req.user),
        }),
      }),
    }),
  ],
})
export class GraphQLModule {}

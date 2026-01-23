import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql'

import { DataLoaderModule } from '../../dataloader/dataloader.module'
import { DataLoaderService } from '../../dataloader/dataloader.service'
import { path } from '../../helpers'
import { GraphQLContext } from './graphql.context'
import { useLoggingPlugin } from './graphql.plugin'
import { useErrorTransformPlugin } from './graphql-error.plugin'

@Module({
  imports: [
    NestGraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      imports: [DataLoaderModule, ConfigModule],
      inject: [DataLoaderService, ConfigService],
      useFactory: (dataLoaderService: DataLoaderService, configService: ConfigService) => ({
        typePaths: [configService.get<string>('GRAPHQL_TYPE_PATHS', path('**/*.graphql'))],
        plugins: [useLoggingPlugin(), useErrorTransformPlugin()],
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

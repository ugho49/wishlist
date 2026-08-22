import { YogaDriver, type YogaDriverConfig } from '@graphql-yoga/nestjs';
import { useDisableIntrospection } from '@graphql-yoga/plugin-disable-introspection';
import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';

import { DataLoaderModule } from '../../dataloader/dataloader.module';
import { DataLoaderService } from '../../dataloader/dataloader.service';
import { path } from '../../helpers';
import { type GraphQLContext } from './graphql.context';
import { useBlockGetRequests, useLoggingPlugin } from './graphql.plugin';
import { useErrorTransformPlugin } from './graphql-error.plugin';

@Module({
  imports: [
    NestGraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      imports: [DataLoaderModule],
      inject: [DataLoaderService],
      useFactory: (dataLoaderService: DataLoaderService) => ({
        typePaths: [path('src/**/*.graphql')],
        plugins: [
          useBlockGetRequests(),
          useLoggingPlugin(),
          useErrorTransformPlugin(),
          ...(process.env.NODE_ENV === 'production' ? [useDisableIntrospection()] : []),
        ],
        graphiql: process.env.NODE_ENV !== 'production',
        context: ({ req }: Omit<GraphQLContext, 'loaders'>): GraphQLContext => ({
          req,
          loaders: dataLoaderService.createLoaders(() => req.user),
        }),
      }),
    }),
  ],
})
export class GraphQLModule {}

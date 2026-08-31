import type { Request, Response } from 'express';

import { YogaDriver, type YogaDriverConfig } from '@graphql-yoga/nestjs';
import { useDisableIntrospection } from '@graphql-yoga/plugin-disable-introspection';
import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { getClientIp } from '@supercharge/request-ip';

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
        context: ({ req, res }: { req: Request; res: Response }): GraphQLContext => {
          const headers = req.headers;
          const ip = getClientIp(req) ?? undefined;
          const userAgent = headers['user-agent'] ?? undefined;

          return {
            res,
            req,
            parsedRequest: {
              userAgent,
              ip,
              headers: {
                authorization: headers.authorization ?? undefined,
              },
            },
            loaders: dataLoaderService.createLoaders(),
          };
        },
      }),
    }),
  ],
})
export class GraphQLModule {}

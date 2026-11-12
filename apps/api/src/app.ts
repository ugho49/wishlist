import type { Plugin } from '@znight/core';

import { ConfigPlugin, env } from '@znight/config';
import { EventsPlugin } from '@znight/events';
import { GraphQLPlugin } from '@znight/graphql';
import { HttpPlugin } from '@znight/http';
import { ObservabilityPlugin } from '@znight/observability';
import { OpenApiPlugin } from '@znight/openapi';

import { Public } from './auth/infrastructure/decorators/public.metadata';
import { AccessGuard } from './auth/infrastructure/guards/access.guard';
import { AuthenticationGuard } from './auth/infrastructure/guards/authentication.guard';
import { UploadExceptionMapper } from './core/bucket/upload-exception.mapper';
import { CoreConfig } from './core/core.config';
import { DatadogErrorTracker } from './core/filters/datadog-error.tracker';
import { InternalErrorResultMapper, RejectionResultMapper } from './core/graphql/rejection.mapper';
import { loggingOptions } from './helpers';

export const SERVICE_NAME = 'wishlist-api';

export type AppPluginsOptions = {
  /** HTTP port; `CoreConfig.port` (`PORT`) when omitted, `0` for a free port in tests. */
  port?: number;
  /** Logger level; `info` when omitted. */
  logLevel?: 'silent' | 'info' | 'debug';
};

/** The plugins of the API, shared by `main.ts` and the integration tests. */
export function createPlugins(options: AppPluginsOptions = {}): Plugin[] {
  return [
    // Bun already loads `.env` into process.env (with ${VAR} expansion)
    ConfigPlugin.configure({ loaders: [env({ env: process.env })] }),
    ObservabilityPlugin.configure(container => ({
      logging: {
        // human-readable logs outside production (NODE_ENV), JSON logs for Datadog in production
        ...loggingOptions(SERVICE_NAME, { pretty: !container.get(CoreConfig).isProduction }),
        ...(options.logLevel ? { level: options.logLevel } : {}),
      },
      // dd-trace instruments the server (see tracer.ts)
      tracing: false,
      metrics: false,
    })),
    EventsPlugin.configure(),
    HttpPlugin.configure(container => ({
      port: options.port ?? container.get(CoreConfig).port,
      host: '0.0.0.0',
      cors: { origin: '*' },
      trustProxy: ['loopback', 'private'],
      requestIdHeader: 'x-request-id',
      guards: [AuthenticationGuard, AccessGuard],
      exceptionMappers: [DatadogErrorTracker, UploadExceptionMapper],
    })),
    GraphQLPlugin.configure(container => ({
      // The endpoint is open: decisions are taken per root field by the AccessGuard
      http: { meta: [Public.meta()], get: false },
      guards: [AccessGuard],
      resultMappers: [RejectionResultMapper, InternalErrorResultMapper],
      // GraphiQL on GET /graphql (accept: text/html) outside production; introspection follows NODE_ENV too
      graphiql: !container.get(CoreConfig).isProduction,
      introspection: !container.get(CoreConfig).isProduction,
    })),
    OpenApiPlugin.configure({ ui: 'swagger', uiPath: '/swagger', meta: [Public.meta()] }),
  ];
}

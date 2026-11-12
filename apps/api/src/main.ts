// Needs to be at the top level for the tracer to work correctly
// (see: https://docs.datadoghq.com/tracing/setup_overview/setup/nodejs?tabs=containers#installation-and-getting-started)
import './tracer';

import { getLogger } from '@znight/observability';

import { createApplication } from './.znight/container.generated';
import { createPlugins } from './app';
import { CoreConfig } from './core/core.config';

const app = await createApplication({ plugins: createPlugins() });
await app.start();

const port = app.container.get(CoreConfig).port;
const logger = getLogger('Bootstrap');
logger.info(`📚 Swagger available on: http://localhost:${port}/swagger`);
logger.info(`🚀 Application is running on: http://localhost:${port}`);
logger.info(`🔗 GraphQL available on: http://localhost:${port}/graphql`);

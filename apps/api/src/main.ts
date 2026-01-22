// Needs to be at the top level for the tracer to work correctly
// (see: https://docs.datadoghq.com/tracing/setup_overview/setup/nodejs?tabs=containers#installation-and-getting-started)
import './tracer'

import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import 'pg'

import { createApp } from './bootstrap'

async function bootstrap() {
  const app = await createApp()
  const configService = app.get(ConfigService)
  const port = configService.get('PORT')

  await app.listen(port, '0.0.0.0')

  Logger.log(`📚 Swagger available on: http://localhost:${port}/swagger`)
  Logger.log(`🚀 Application is running on: http://localhost:${port}`)
  Logger.log(`🔗 GraphQL available on: http://localhost:${port}/graphql`)
}

void bootstrap()

import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import 'pg'

import { createApp } from './bootstrap'

declare const module: { hot?: { accept: () => void; dispose: (callback: () => void) => void } }

async function bootstrap() {
  const app = await createApp()
  const configService = app.get(ConfigService)
  const port = configService.get('PORT')

  await app.listen(port, '0.0.0.0')

  Logger.log(`📚 Swagger available on: http://localhost:${port}/swagger`)
  Logger.log(`🚀 Application is running on: http://localhost:${port}`)

  // Enable HMR in development
  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}

void bootstrap()

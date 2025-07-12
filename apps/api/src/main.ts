import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import 'pg'

import { createApp } from './bootstrap'

;(async function () {
  const app = await createApp()
  const configService = app.get(ConfigService)
  const port = configService.get('PORT')

  await app.listen(port, '0.0.0.0')

  Logger.log(`📚 Swagger available on: http://localhost:${port}/swagger`)
  Logger.log(`🚀 Application is running on: http://localhost:${port}`)
})()

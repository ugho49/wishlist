import { Module } from '@nestjs/common'

import { EmailSettingsController } from './email-settings.controller'
import { EmailSettingsRepository } from './email-settings.repository'
import { EmailSettingsService } from './email-settings.service'

@Module({
  controllers: [EmailSettingsController],
  providers: [EmailSettingsService, EmailSettingsRepository],
})
export class EmailSettingsModule {}

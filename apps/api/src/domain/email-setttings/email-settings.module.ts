import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EmailSettingsController } from './email-settings.controller.js'
import { UserEmailSettingEntity } from './email-settings.entity.js'
import { EmailSettingsRepository } from './email-settings.repository.js'
import { EmailSettingsService } from './email-settings.service.js'

@Module({
  imports: [TypeOrmModule.forFeature([UserEmailSettingEntity])],
  controllers: [EmailSettingsController],
  providers: [EmailSettingsService, EmailSettingsRepository],
})
export class EmailSettingsModule {}

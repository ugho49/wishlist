import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EmailSettingsController } from './email-settings.controller'
import { UserEmailSettingEntity } from './email-settings.entity'
import { EmailSettingsRepository } from './email-settings.repository'
import { EmailSettingsService } from './email-settings.service'

@Module({
  imports: [TypeOrmModule.forFeature([UserEmailSettingEntity])],
  controllers: [EmailSettingsController],
  providers: [EmailSettingsService, EmailSettingsRepository],
})
export class EmailSettingsModule {}

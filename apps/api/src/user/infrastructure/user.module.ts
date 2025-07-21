import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { handlers } from '../application'
import { UserAdminController } from './controllers/user-admin.controller'
import { UserEmailSettingsController } from './controllers/user-email-settings.controller'
import { UserPasswordVerificationController } from './controllers/user-password-verification.controller'
import { UserController } from './controllers/user.controller'
import { LegacyEmailSettingsService } from './legacy-email-settings.service'
import { LegacyUserService } from './legacy-user.service'
import userConfig from './user.config'

@Module({
  imports: [ConfigModule.forFeature(userConfig)],
  controllers: [UserController, UserAdminController, UserEmailSettingsController, UserPasswordVerificationController],
  providers: [LegacyUserService, LegacyEmailSettingsService, ...handlers],
})
export class UserModule {}

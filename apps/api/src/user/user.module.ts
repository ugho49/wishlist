import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { LegacyEmailSettingsService, LegacyPasswordVerificationService, LegacyUserService } from './infrastructure'
import { EmailSettingsController } from './infrastructure/controllers/email-settings.controller'
import { PasswordVerificationController } from './infrastructure/controllers/password-verification.controller'
import { UserAdminController } from './infrastructure/controllers/user-admin.controller'
import { UserController } from './infrastructure/controllers/user.controller'
import { PasswordVerificationMailer } from './infrastructure/password-verification.mailer.ts'
import userConfig from './infrastructure/user.config'
import { UserMailer } from './infrastructure/user.mailer'

@Module({
  imports: [ConfigModule.forFeature(userConfig)],
  controllers: [UserController, UserAdminController, EmailSettingsController, PasswordVerificationController],
  providers: [
    LegacyUserService,
    UserMailer,
    LegacyEmailSettingsService,
    LegacyPasswordVerificationService,
    PasswordVerificationMailer,
  ],
})
export class UserModule {}

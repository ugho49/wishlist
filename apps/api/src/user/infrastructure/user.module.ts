import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { EmailSettingsController } from './controllers/email-settings.controller'
import { PasswordVerificationController } from './controllers/password-verification.controller'
import { UserAdminController } from './controllers/user-admin.controller'
import { UserController } from './controllers/user.controller'
import { LegacyEmailSettingsService } from './legacy-email-settings.service'
import { LegacyPasswordVerificationService } from './legacy-password-verification.service'
import { LegacyUserService } from './legacy-user.service'
import { PasswordVerificationMailer } from './password-verification.mailer'
import userConfig from './user.config'
import { UserMailer } from './user.mailer'

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

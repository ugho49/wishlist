import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { handlers } from '../application'
import { UserController } from './controllers/user.controller'
import { UserAdminController } from './controllers/user-admin.controller'
import { UserEmailChangeController } from './controllers/user-email-change.controller'
import { UserEmailSettingsController } from './controllers/user-email-settings.controller'
import { UserPasswordVerificationController } from './controllers/user-password-verification.controller'
import userConfig from './user.config'
import { UserDataLoaderFactory } from './user.dataloader'
import { UserResolver } from './user.resolver'

@Module({
  imports: [ConfigModule.forFeature(userConfig)],
  controllers: [
    UserController,
    UserAdminController,
    UserEmailChangeController,
    UserEmailSettingsController,
    UserPasswordVerificationController,
  ],
  providers: [...handlers, UserResolver, UserDataLoaderFactory],
  exports: [UserDataLoaderFactory],
})
export class UserModule {}

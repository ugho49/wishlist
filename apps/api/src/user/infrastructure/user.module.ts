import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { handlers } from '../application'
import { UserController } from './controllers/user.controller'
import { UserAdminController } from './controllers/user-admin.controller'
import { UserEmailChangeController } from './controllers/user-email-change.controller'
import { UserEmailSettingsController } from './controllers/user-email-settings.controller'
import { UserPasswordVerificationController } from './controllers/user-password-verification.controller'
import { UserFieldResolver } from './resolvers/user.field-resolver'
import { UserResolver } from './resolvers/user.resolver'
import userConfig from './user.config'
import { UserDataLoaderFactory } from './user.dataloader'

@Module({
  imports: [ConfigModule.forFeature(userConfig)],
  controllers: [
    UserController,
    UserAdminController,
    UserEmailChangeController,
    UserEmailSettingsController,
    UserPasswordVerificationController,
  ],
  providers: [...handlers, UserResolver, UserFieldResolver, UserDataLoaderFactory],
  exports: [UserDataLoaderFactory],
})
export class UserModule {}

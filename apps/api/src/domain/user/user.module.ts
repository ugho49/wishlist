import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthSocialModule } from '../auth-social/auth-social.module.js'
import { UserAdminController } from './controllers/user-admin.controller.js'
import { UserController } from './controllers/user.controller.js'
import { UserSocialEntity } from './user-social.entity.js'
import { UserSocialRepository } from './user-social.repository.js'
import { UserEntity } from './user.entity.js'
import { UserMailer } from './user.mailer.js'
import { UserRepository } from './user.repository.js'
import { UserService } from './user.service.js'

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserSocialEntity]), AuthSocialModule],
  controllers: [UserController, UserAdminController],
  providers: [UserService, UserRepository, UserSocialRepository, UserMailer],
  exports: [UserRepository, UserSocialRepository],
})
export class UserModule {}

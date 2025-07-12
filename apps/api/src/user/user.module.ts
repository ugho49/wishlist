import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthSocialModule } from '../auth-social/auth-social.module'
import { UserAdminController } from './controllers/user-admin.controller'
import { UserController } from './controllers/user.controller'
import { UserSocialEntity } from './user-social.entity'
import { UserSocialRepository } from './user-social.repository'
import { UserEntity } from './user.entity'
import { UserMailer } from './user.mailer'
import { UserRepository } from './user.repository'
import { UserService } from './user.service'

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserSocialEntity]), AuthSocialModule],
  controllers: [UserController, UserAdminController],
  providers: [UserService, UserRepository, UserSocialRepository, UserMailer],
  exports: [UserRepository, UserSocialRepository],
})
export class UserModule {}

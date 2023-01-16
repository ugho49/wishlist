import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserController } from './controllers/user.controller';
import { UserAdminController } from './controllers/user-admin.controller';
import { UserRepository } from './user.repository';
import { UserMailer } from './user.mailer';
import { AuthSocialModule } from '../auth-social/auth-social.module';
import { UserSocialEntity } from './user-social.entity';
import { UserSocialRepository } from './user-social.repository';
import { BucketModule } from '../../core/bucket/bucket.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserSocialEntity]), AuthSocialModule, BucketModule],
  controllers: [UserController, UserAdminController],
  providers: [UserService, UserRepository, UserSocialRepository, UserMailer],
  exports: [UserRepository, UserSocialRepository],
})
export class UserModule {}

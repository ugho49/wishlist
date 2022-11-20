import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserEmailSettingEntity } from './entities/user-email-settings.entity';
import { UserEmailSettingsService } from './services/user-email-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserEmailSettingEntity])],
  providers: [UserService, UserEmailSettingsService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserController } from './controllers/user.controller';
import { UserEmailSettingEntity } from './entities/user-email-settings.entity';
import { UserEmailSettingsService } from './services/user-email-settings.service';
import { UserEmailSettingsController } from './controllers/user-email-settings.controller';
import { UserPasswordVerificationController } from './controllers/user-password-verification.controller';
import { UserPasswordVerificationService } from './services/user-password-verification.service';
import { UserPasswordVerificationEntity } from './entities/user-password-verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserEmailSettingEntity, UserPasswordVerificationEntity])],
  controllers: [UserController, UserEmailSettingsController, UserPasswordVerificationController],
  providers: [UserService, UserEmailSettingsService, UserPasswordVerificationService],
  exports: [UserService],
})
export class UserModule {}

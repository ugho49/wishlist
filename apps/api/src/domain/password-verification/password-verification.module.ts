import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordVerificationController } from './password-verification.controller';
import { PasswordVerificationService } from './password-verification.service';
import { PasswordVerificationEntity } from './password-verification.entity';
import { ConfigModule } from '@nestjs/config';
import passwordVerificationConfig from './password-verification.config';
import { UserModule } from '../user/user.module';
import { PasswordVerificationRepository } from './password-verification.repository';
import { PasswordVerificationMailer } from './password-verification.mailer';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([PasswordVerificationEntity]),
    ConfigModule.forFeature(passwordVerificationConfig),
  ],
  controllers: [PasswordVerificationController],
  providers: [PasswordVerificationService, PasswordVerificationRepository, PasswordVerificationMailer],
})
export class PasswordVerificationModule {}

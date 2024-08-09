import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserModule } from '../user/user.module.js'
import passwordVerificationConfig from './password-verification.config.js'
import { PasswordVerificationController } from './password-verification.controller.js'
import { PasswordVerificationEntity } from './password-verification.entity.js'
import { PasswordVerificationMailer } from './password-verification.mailer.js'
import { PasswordVerificationRepository } from './password-verification.repository.js'
import { PasswordVerificationService } from './password-verification.service.js'

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

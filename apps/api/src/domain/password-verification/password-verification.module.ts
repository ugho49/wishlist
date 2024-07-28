import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserModule } from '../user/user.module'
import passwordVerificationConfig from './password-verification.config'
import { PasswordVerificationController } from './password-verification.controller'
import { PasswordVerificationEntity } from './password-verification.entity'
import { PasswordVerificationMailer } from './password-verification.mailer'
import { PasswordVerificationRepository } from './password-verification.repository'
import { PasswordVerificationService } from './password-verification.service'

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

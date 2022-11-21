import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './auth/jwt/jwt.guard';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailSettingsModule } from './email-setttings/email-settings.module';
import { PasswordVerificationModule } from './password-verification/password-verification.module';

@Module({
  imports: [AuthModule, UserModule, EmailSettingsModule, PasswordVerificationModule],
  providers: [{ provide: APP_GUARD, useClass: JwtGuard }],
})
export class DomainModule {}

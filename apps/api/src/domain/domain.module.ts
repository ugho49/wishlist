import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailSettingsModule } from './email-setttings/email-settings.module';
import { PasswordVerificationModule } from './password-verification/password-verification.module';

@Module({
  imports: [AuthModule, UserModule, EmailSettingsModule, PasswordVerificationModule],
})
export class DomainModule {}

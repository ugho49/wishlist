import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import authSocialConfig from './auth-social.config';
import { GoogleAuthService } from './services';

@Module({
  imports: [ConfigModule.forFeature(authSocialConfig)],
  providers: [GoogleAuthService],
  exports: [GoogleAuthService],
})
export class AuthSocialModule {}

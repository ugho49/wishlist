import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import authSocialConfig from './auth-social.config.js'
import { GoogleAuthService } from './services/index.js'

@Module({
  imports: [ConfigModule.forFeature(authSocialConfig)],
  providers: [GoogleAuthService],
  exports: [GoogleAuthService],
})
export class AuthSocialModule {}

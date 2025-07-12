import { Module } from '@nestjs/common'
import { ConfigModule, ConfigType } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { AuthSocialModule } from '../auth-social/auth-social.module'
import { UserModule } from '../user/user.module'
import authConfig from './auth.config'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthGuard } from './guards/auth.guard'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
  imports: [
    AuthSocialModule,
    ConfigModule.forFeature(authConfig),
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(authConfig)],
      inject: [authConfig.KEY],
      useFactory: (config: ConfigType<typeof authConfig>) => ({
        secret: config.accessToken.secret,
        signOptions: {
          expiresIn: config.accessToken.duration,
          algorithm: config.accessToken.algorithm,
          issuer: config.issuer,
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, { provide: APP_GUARD, useClass: AuthGuard }],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

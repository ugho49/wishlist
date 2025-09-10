import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigType } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { GoogleAuthService } from '.'
import { handlers } from '../application'
import authConfig from './auth.config'
import { AuthController } from './auth.controller'
import { AuthGuard } from './guards/auth.guard'
import { JwtStrategy } from './strategies/jwt.strategy'

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
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
  providers: [...handlers, GoogleAuthService, JwtStrategy, { provide: APP_GUARD, useClass: AuthGuard }],
  controllers: [AuthController],
  exports: [GoogleAuthService],
})
export class AuthModule {}

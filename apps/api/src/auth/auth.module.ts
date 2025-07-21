import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigType } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { GoogleAuthService } from './infrastructure'
import authConfig from './infrastructure/auth.config'
import { AuthController } from './infrastructure/auth.controller'
import { AuthService } from './infrastructure/auth.service'
import { AuthGuard } from './infrastructure/guards/auth.guard'
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy'

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
  providers: [AuthService, GoogleAuthService, JwtStrategy, { provide: APP_GUARD, useClass: AuthGuard }],
  controllers: [AuthController],
  exports: [GoogleAuthService],
})
export class AuthModule {}

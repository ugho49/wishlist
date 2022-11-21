import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import authConfig from './auth.config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(authConfig)],
      inject: [authConfig.KEY],
      useFactory: (config: ConfigType<typeof authConfig>) => ({
        secret: config.secret,
        signOptions: { expiresIn: config.duration, algorithm: config.algorithm, issuer: config.issuer },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, { provide: APP_GUARD, useClass: AuthGuard }],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

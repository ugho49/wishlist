import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtGuard } from './auth/jwt/jwt.guard';

@Module({
  imports: [AuthModule, UserModule],
  providers: [{ provide: APP_GUARD, useClass: JwtGuard }],
})
export class DomainModule {}

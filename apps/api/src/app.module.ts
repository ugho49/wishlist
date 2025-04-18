import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CqrsModule } from '@nestjs/cqrs'

import { AttendeeModule } from './attendee/attendee.module'
import { AuthSocialModule } from './auth-social/auth-social.module'
import { AuthModule } from './auth/auth.module'
import { CoreModule } from './core/core.module'
import { EmailSettingsModule } from './email-setttings/email-settings.module'
import { EventModule } from './event/event.module'
import { HealthModule } from './health/health.module'
import { ItemModule } from './item/item.module'
import { PasswordVerificationModule } from './password-verification/password-verification.module'
import { SecretSantaModule } from './secret-santa/secret-santa.module'
import { UserModule } from './user/user.module'
import { WishlistModule } from './wishlist/wishlist.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
    CqrsModule.forRoot(),
    HealthModule,
    CoreModule,
    AuthModule,
    AuthSocialModule,
    UserModule,
    EmailSettingsModule,
    PasswordVerificationModule,
    WishlistModule,
    ItemModule,
    EventModule,
    AttendeeModule,
    SecretSantaModule,
  ],
})
export class AppModule {}

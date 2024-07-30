import { Module } from '@nestjs/common'

import { AttendeeModule } from './attendee/attendee.module'
import { AuthSocialModule } from './auth-social/auth-social.module'
import { AuthModule } from './auth/auth.module'
import { EmailSettingsModule } from './email-setttings/email-settings.module'
import { EventModule } from './event/event.module'
import { ItemModule } from './item/item.module'
import { PasswordVerificationModule } from './password-verification/password-verification.module'
import { UserModule } from './user/user.module'
import { WishlistModule } from './wishlist/wishlist.module'

@Module({
  imports: [
    AuthModule,
    AuthSocialModule,
    UserModule,
    EmailSettingsModule,
    PasswordVerificationModule,
    WishlistModule,
    ItemModule,
    EventModule,
    AttendeeModule,
  ],
})
export class DomainModule {}

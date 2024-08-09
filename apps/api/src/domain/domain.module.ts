import { Module } from '@nestjs/common'

import { AttendeeModule } from './attendee/attendee.module.js'
import { AuthSocialModule } from './auth-social/auth-social.module.js'
import { AuthModule } from './auth/auth.module.js'
import { EmailSettingsModule } from './email-setttings/email-settings.module.js'
import { EventModule } from './event/event.module.js'
import { ItemModule } from './item/item.module.js'
import { PasswordVerificationModule } from './password-verification/password-verification.module.js'
import { SecretSantaModule } from './secret-santa/secret-santa.module.js'
import { UserModule } from './user/user.module.js'
import { WishlistModule } from './wishlist/wishlist.module.js'

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
    SecretSantaModule,
  ],
})
export class DomainModule {}

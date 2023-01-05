import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailSettingsModule } from './email-setttings/email-settings.module';
import { PasswordVerificationModule } from './password-verification/password-verification.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ItemModule } from './item/item.module';
import { EventModule } from './event/event.module';
import { AttendeeModule } from './attendee/attendee.module';
import { AuthSocialModule } from './auth-social/auth-social.module';

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

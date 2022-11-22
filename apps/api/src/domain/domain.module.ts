import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailSettingsModule } from './email-setttings/email-settings.module';
import { PasswordVerificationModule } from './password-verification/password-verification.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ItemModule } from './item/item.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    EmailSettingsModule,
    PasswordVerificationModule,
    WishlistModule,
    ItemModule,
    EventModule,
  ],
})
export class DomainModule {}

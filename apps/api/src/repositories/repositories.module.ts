import { Global, Module } from '@nestjs/common'

import { PostgresEventRepository } from './postgres-event.repository'
import { PostgresEventAttendeeRepository } from './postgres-event-attendee.repository'
import { PostgresSecretSantaRepository } from './postgres-secret-santa.repository'
import { PostgresSecretSantaUserRepository } from './postgres-secret-santa-user.repository'
import { PostgresUserRepository } from './postgres-user.repository'
import { PostgresUserEmailSettingRepository } from './postgres-user-email-setting'
import { PostgresUserPasswordVerificationRepository } from './postgres-user-password-verification'
import { PostgresUserSocialRepository } from './postgres-user-social.repository'
import { PostgresWishlistRepository } from './postgres-wishlist.repository'
import { PostgresWishlistItemRepository } from './postgres-wishlist-item.repository'
import { REPOSITORIES } from './repositories.constants'

@Global()
@Module({
  providers: [
    {
      provide: REPOSITORIES.EVENT_ATTENDEE,
      useClass: PostgresEventAttendeeRepository,
    },
    {
      provide: REPOSITORIES.EVENT,
      useClass: PostgresEventRepository,
    },
    {
      provide: REPOSITORIES.SECRET_SANTA,
      useClass: PostgresSecretSantaRepository,
    },
    {
      provide: REPOSITORIES.SECRET_SANTA_USER,
      useClass: PostgresSecretSantaUserRepository,
    },
    {
      provide: REPOSITORIES.USER,
      useClass: PostgresUserRepository,
    },
    {
      provide: REPOSITORIES.USER_SOCIAL,
      useClass: PostgresUserSocialRepository,
    },
    {
      provide: REPOSITORIES.USER_EMAIL_SETTING,
      useClass: PostgresUserEmailSettingRepository,
    },
    {
      provide: REPOSITORIES.USER_PASSWORD_VERIFICATION,
      useClass: PostgresUserPasswordVerificationRepository,
    },
    {
      provide: REPOSITORIES.WISHLIST,
      useClass: PostgresWishlistRepository,
    },
    {
      provide: REPOSITORIES.WISHLIST_ITEM,
      useClass: PostgresWishlistItemRepository,
    },
  ],
  exports: [
    REPOSITORIES.EVENT,
    REPOSITORIES.EVENT_ATTENDEE,
    REPOSITORIES.SECRET_SANTA,
    REPOSITORIES.SECRET_SANTA_USER,
    REPOSITORIES.USER,
    REPOSITORIES.USER_SOCIAL,
    REPOSITORIES.USER_EMAIL_SETTING,
    REPOSITORIES.USER_PASSWORD_VERIFICATION,
    REPOSITORIES.WISHLIST,
    REPOSITORIES.WISHLIST_ITEM,
  ],
})
export class RepositoriesModule {}

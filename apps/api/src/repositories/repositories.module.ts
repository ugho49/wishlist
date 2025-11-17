import { Global, Module, type Type } from '@nestjs/common'

import { PostgresEventRepository } from './impl/postgres-event.repository'
import { PostgresEventAttendeeRepository } from './impl/postgres-event-attendee.repository'
import { PostgresSecretSantaRepository } from './impl/postgres-secret-santa.repository'
import { PostgresSecretSantaUserRepository } from './impl/postgres-secret-santa-user.repository'
import { PostgresUserRepository } from './impl/postgres-user.repository'
import { PostgresUserEmailSettingRepository } from './impl/postgres-user-email-setting.repository'
import { PostgresUserPasswordVerificationRepository } from './impl/postgres-user-password-verification'
import { PostgresUserSocialRepository } from './impl/postgres-user-social.repository'
import { PostgresWishlistRepository } from './impl/postgres-wishlist.repository'
import { PostgresWishlistItemRepository } from './impl/postgres-wishlist-item.repository'
import { REPOSITORIES } from './repositories.constants'

const repositoryProviders: Record<keyof typeof REPOSITORIES, Type<unknown>> = {
  EVENT_ATTENDEE: PostgresEventAttendeeRepository,
  EVENT: PostgresEventRepository,
  SECRET_SANTA: PostgresSecretSantaRepository,
  SECRET_SANTA_USER: PostgresSecretSantaUserRepository,
  USER: PostgresUserRepository,
  USER_SOCIAL: PostgresUserSocialRepository,
  USER_EMAIL_SETTING: PostgresUserEmailSettingRepository,
  USER_PASSWORD_VERIFICATION: PostgresUserPasswordVerificationRepository,
  WISHLIST: PostgresWishlistRepository,
  WISHLIST_ITEM: PostgresWishlistItemRepository,
}

@Global()
@Module({
  providers: [
    ...Object.entries(repositoryProviders).map(([key, value]) => ({
      provide: REPOSITORIES[key as keyof typeof REPOSITORIES],
      useClass: value,
    })),
  ],
  exports: [...Object.values(REPOSITORIES)],
})
export class RepositoriesModule {}

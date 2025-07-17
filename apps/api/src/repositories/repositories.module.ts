import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AttendeeEntity } from '../attendee/infrastructure/legacy-attendee.entity'
import { EventEntity } from '../event/infrastructure/legacy-event.entity'
import { LegacyEventRepository } from '../event/infrastructure/legacy-event.repository'
import { ItemEntity } from '../item/infrastructure/item.entity'
import { UserEmailSettingEntity } from '../user/infrastructure/legacy-email-settings.entity'
import { LegacyEmailSettingsRepository } from '../user/infrastructure/legacy-email-settings.repository'
import { LegacyPasswordVerificationRepository } from '../user/infrastructure/legacy-password-verification-repository.service'
import { PasswordVerificationEntity } from '../user/infrastructure/legacy-password-verification.entity'
import { UserSocialEntity } from '../user/infrastructure/legacy-user-social.entity'
import { UserEntity } from '../user/infrastructure/legacy-user.entity'
import { LegacyUserRepository } from '../user/infrastructure/legacy-user.repository'
import { WishlistEntity } from '../wishlist/infrastructure/legacy-wishlist.entity'
import { LegacyWishlistRepository } from '../wishlist/infrastructure/legacy-wishlist.repository'
import { PostgresAttendeeRepository } from './attendee.repository'
import { PostgresEventRepository } from './event.repository'
import * as tokens from './repositories.tokens'
import { PostgresSecretSantaUserRepository } from './secret-santa-user.repository'
import { PostgresSecretSantaRepository } from './secret-santa.repository'
import { PostgresUserSocialRepository } from './user-social.repository'
import { PostgresUserRepository } from './user.repository'
import { PostgresWishlistItemRepository } from './wishlist-item.repository'
import { PostgresWishlistRepository } from './wishlist.repository'

const legacyRepositories = [
  LegacyEventRepository,
  LegacyUserRepository,
  LegacyPasswordVerificationRepository,
  LegacyEmailSettingsRepository,
  LegacyWishlistRepository,
]

const legacyEntities = TypeOrmModule.forFeature([
  EventEntity,
  WishlistEntity,
  UserEntity,
  UserSocialEntity,
  UserEmailSettingEntity,
  PasswordVerificationEntity,
  ItemEntity,
  AttendeeEntity,
])

@Global()
@Module({
  imports: [legacyEntities],
  providers: [
    ...legacyRepositories,
    {
      provide: tokens.ATTENDEE_REPOSITORY,
      useClass: PostgresAttendeeRepository,
    },
    {
      provide: tokens.EVENT_REPOSITORY,
      useClass: PostgresEventRepository,
    },
    {
      provide: tokens.SECRET_SANTA_REPOSITORY,
      useClass: PostgresSecretSantaRepository,
    },
    {
      provide: tokens.SECRET_SANTA_USER_REPOSITORY,
      useClass: PostgresSecretSantaUserRepository,
    },
    {
      provide: tokens.USER_REPOSITORY,
      useClass: PostgresUserRepository,
    },
    {
      provide: tokens.USER_SOCIAL_REPOSITORY,
      useClass: PostgresUserSocialRepository,
    },
    {
      provide: tokens.WISHLIST_REPOSITORY,
      useClass: PostgresWishlistRepository,
    },
    {
      provide: tokens.WISHLIST_ITEM_REPOSITORY,
      useClass: PostgresWishlistItemRepository,
    },
  ],
  exports: [
    ...legacyRepositories,
    tokens.ATTENDEE_REPOSITORY,
    tokens.EVENT_REPOSITORY,
    tokens.SECRET_SANTA_REPOSITORY,
    tokens.SECRET_SANTA_USER_REPOSITORY,
    tokens.USER_REPOSITORY,
    tokens.USER_SOCIAL_REPOSITORY,
    tokens.WISHLIST_REPOSITORY,
    tokens.WISHLIST_ITEM_REPOSITORY,
  ],
})
export class RepositoriesModule {}

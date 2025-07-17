import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AttendeeEntity } from '../attendee/infrastructure/legacy-attendee.entity'
import { EventEntity } from '../event/infrastructure/legacy-event.entity'
import { LegacyEventRepository } from '../event/infrastructure/legacy-event.repository'
import { ItemEntity, LegacyItemRepository } from '../item'
import {
  LegacyEmailSettingsRepository,
  LegacyPasswordVerificationRepository,
  LegacyUserRepository,
  LegacyUserSocialRepository,
  PasswordVerificationEntity,
  UserEmailSettingEntity,
  UserEntity,
  UserSocialEntity,
} from '../user'
import { LegacyWishlistRepository, WishlistEntity } from '../wishlist'
import { PostgresAttendeeRepository } from './attendee.repository'
import { PostgresEventRepository } from './event.repository'
import * as tokens from './repositories.tokens'
import { PostgresSecretSantaUserRepository } from './secret-santa-user.repository'
import { PostgresSecretSantaRepository } from './secret-santa.repository'
import { PostgresUserRepository } from './user.repository'
import { PostgresWishlistItemRepository } from './wishlist-item.repository'
import { PostgresWishlistRepository } from './wishlist.repository'

const legacyRepositories = [
  LegacyEventRepository,
  LegacyItemRepository,
  LegacyUserRepository,
  LegacyUserSocialRepository,
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
    tokens.WISHLIST_REPOSITORY,
    tokens.WISHLIST_ITEM_REPOSITORY,
  ],
})
export class RepositoriesModule {}

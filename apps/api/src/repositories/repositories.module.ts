import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AttendeeEntity } from '../event/infrastructure/legacy-attendee.entity'
import { EventEntity } from '../event/infrastructure/legacy-event.entity'
import { ItemEntity } from '../item/infrastructure/item.entity'
import { UserEmailSettingEntity } from '../user/infrastructure/legacy-email-settings.entity'
import { LegacyEmailSettingsRepository } from '../user/infrastructure/legacy-email-settings.repository'
import { UserSocialEntity } from '../user/infrastructure/legacy-user-social.entity'
import { UserEntity } from '../user/infrastructure/legacy-user.entity'
import { LegacyUserRepository } from '../user/infrastructure/legacy-user.repository'
import { WishlistEntity } from '../wishlist/infrastructure/legacy-wishlist.entity'
import { PostgresEventAttendeeRepository } from './postgres-event-attendee.repository'
import { PostgresEventRepository } from './postgres-event.repository'
import { PostgresSecretSantaUserRepository } from './postgres-secret-santa-user.repository'
import { PostgresSecretSantaRepository } from './postgres-secret-santa.repository'
import { PostgresUserEmailSettingRepository } from './postgres-user-email-setting'
import { PostgresUserPasswordVerificationRepository } from './postgres-user-password-verification'
import { PostgresUserSocialRepository } from './postgres-user-social.repository'
import { PostgresUserRepository } from './postgres-user.repository'
import { PostgresWishlistItemRepository } from './postgres-wishlist-item.repository'
import { PostgresWishlistRepository } from './postgres-wishlist.repository'
import * as tokens from './repositories.tokens'

const legacyRepositories = [LegacyUserRepository, LegacyEmailSettingsRepository]

const legacyEntities = TypeOrmModule.forFeature([
  EventEntity,
  WishlistEntity,
  UserEntity,
  UserSocialEntity,
  UserEmailSettingEntity,
  ItemEntity,
  AttendeeEntity,
])

@Global()
@Module({
  imports: [legacyEntities],
  providers: [
    ...legacyRepositories,
    {
      provide: tokens.EVENT_ATTENDEE_REPOSITORY,
      useClass: PostgresEventAttendeeRepository,
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
      provide: tokens.USER_EMAIL_SETTING_REPOSITORY,
      useClass: PostgresUserEmailSettingRepository,
    },
    {
      provide: tokens.USER_PASSWORD_VERIFICATION_REPOSITORY,
      useClass: PostgresUserPasswordVerificationRepository,
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
    tokens.EVENT_REPOSITORY,
    tokens.EVENT_ATTENDEE_REPOSITORY,
    tokens.SECRET_SANTA_REPOSITORY,
    tokens.SECRET_SANTA_USER_REPOSITORY,
    tokens.USER_REPOSITORY,
    tokens.USER_SOCIAL_REPOSITORY,
    tokens.USER_EMAIL_SETTING_REPOSITORY,
    tokens.USER_PASSWORD_VERIFICATION_REPOSITORY,
    tokens.WISHLIST_REPOSITORY,
    tokens.WISHLIST_ITEM_REPOSITORY,
  ],
})
export class RepositoriesModule {}

import type { MiniUserDto, PendingEmailChangeDto, UserDto, UserEmailSettingsDto, UserSocialDto } from '@wishlist/common'
import type {
  MiniUserObject,
  PendingEmailChangeObject,
  UserEmailSettingsObject,
  UserObject,
  UserSocialObject,
} from '../types'

export const userGraphQLMapper = {
  toUserSocialObject(dto: UserSocialDto): UserSocialObject {
    return {
      id: dto.id,
      email: dto.email,
      name: dto.name,
      socialId: dto.social_id,
      socialType: dto.social_type,
      pictureUrl: dto.picture_url,
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
    }
  },

  toMiniUserObject(dto: MiniUserDto): MiniUserObject {
    return {
      id: dto.id,
      firstname: dto.firstname,
      lastname: dto.lastname,
      email: dto.email,
      pictureUrl: dto.picture_url,
    }
  },

  toUserObject(dto: UserDto): UserObject {
    return {
      id: dto.id,
      firstname: dto.firstname,
      lastname: dto.lastname,
      email: dto.email,
      pictureUrl: dto.picture_url,
      birthday: dto.birthday,
      isAdmin: dto.admin,
      isEnabled: dto.is_enabled,
      lastConnectedAt: dto.last_connected_at,
      socials: dto.social.map(s => userGraphQLMapper.toUserSocialObject(s)),
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
    }
  },

  toUserEmailSettingsObject(dto: UserEmailSettingsDto): UserEmailSettingsObject {
    return {
      dailyNewItemNotification: dto.daily_new_item_notification,
    }
  },

  toPendingEmailChangeObject(dto: PendingEmailChangeDto): PendingEmailChangeObject {
    return {
      newEmail: dto.new_email,
      expiredAt: dto.expired_at,
    }
  },
}

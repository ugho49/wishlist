import type { MiniUserDto, UserDto } from '@wishlist/common-types'

import type { UserEntity } from './user.entity'

import { DateTime } from 'luxon'

export async function toUserDto(entity: UserEntity): Promise<UserDto> {
  const socials = await entity.socials

  return {
    ...toMiniUserDto(entity),
    admin: entity.isAdmin(),
    birthday: entity.birthday ? DateTime.fromJSDate(entity.birthday).toISODate() || '' : undefined,
    is_enabled: entity.isEnabled,
    last_connected_at: entity.lastConnectedAt?.toISOString(),
    last_ip: entity.lastIp || undefined,
    social: socials.map(social => ({
      id: social.id,
      social_id: social.socialId,
      social_type: social.socialType,
      picture_url: social.pictureUrl ? social.pictureUrl : undefined,
      created_at: social.createdAt.toISOString(),
      updated_at: social.updatedAt.toISOString(),
    })),
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  }
}

export function toMiniUserDto(entity: UserEntity): MiniUserDto {
  return {
    id: entity.id,
    firstname: entity.firstName,
    lastname: entity.lastName,
    email: entity.email,
    picture_url: entity.pictureUrl || undefined,
  }
}

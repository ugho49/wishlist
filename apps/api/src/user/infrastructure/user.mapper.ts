import type { MiniUserDto, UserDto, UserSocialDto, UserWithoutSocialsDto } from '@wishlist/common'
import type { User, UserSocial } from '../domain'

import { DateTime } from 'luxon'

function toMiniUserDto(model: User): MiniUserDto {
  return {
    id: model.id,
    firstname: model.firstName,
    lastname: model.lastName,
    email: model.email,
    picture_url: model.pictureUrl,
  }
}

function toUserWithoutSocialsDto(user: User): UserWithoutSocialsDto {
  return {
    ...toMiniUserDto(user),
    admin: user.isAdmin(),
    birthday: user.birthday ? DateTime.fromJSDate(user.birthday).toISODate() || '' : undefined,
    is_enabled: user.isEnabled,
    has_password: !!user.passwordEnc,
    last_connected_at: user.lastConnectedAt?.toISOString(),
    last_ip: user.lastIp,
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString(),
  }
}

function toUserSocialDto(social: UserSocial): UserSocialDto {
  return {
    id: social.id,
    email: social.email,
    name: social.name,
    social_id: social.socialId,
    social_type: social.socialType,
    picture_url: social.pictureUrl,
    created_at: social.createdAt.toISOString(),
    updated_at: social.updatedAt.toISOString(),
  }
}

function toUserDto(params: { user: User; socials: UserSocial[] }): UserDto {
  const { user, socials } = params

  return {
    ...toUserWithoutSocialsDto(user),
    social: socials.map(social => toUserSocialDto(social)),
  }
}

export const userMapper = {
  toMiniUserDto,
  toUserWithoutSocialsDto,
  toUserDto,
  toUserSocialDto,
}

import { UserSocialTable, UserTable } from '@wishlist/common-database'
import { MiniUserDto, UserDto } from '@wishlist/common-types'
import { User, UserSocial } from '@wishlist/domain'
import { Insertable, Selectable } from 'kysely'
import { DateTime } from 'luxon'

import { UserEntity } from './user.entity'

/**
 * @Deprecated: in favor of UserMapper.toMiniUserDto
 */
export function toMiniUserDto(entity: UserEntity): MiniUserDto {
  return {
    id: entity.id,
    firstname: entity.firstName,
    lastname: entity.lastName,
    email: entity.email,
    picture_url: entity.pictureUrl || undefined,
  }
}

export const UserMapper = {
  toMiniUserDto: (user: User): MiniUserDto => ({
    id: user.id,
    firstname: user.firstName,
    lastname: user.lastName,
    email: user.email,
    picture_url: user.pictureUrl || undefined,
  }),
  toUserDto: (user: User): UserDto => ({
    ...UserMapper.toMiniUserDto(user),
    admin: user.isAdmin(),
    birthday: user.birthday ? DateTime.fromJSDate(user.birthday).toISODate() || '' : undefined,
    is_enabled: user.isEnabled,
    last_connected_at: user.lastConnectedAt?.toISOString(),
    last_ip: user.lastIp || undefined,
    social: user.socials.map(social => ({
      id: social.id,
      social_id: social.externalProviderId,
      social_type: social.socialType,
      picture_url: social.pictureUrl ? social.pictureUrl : undefined,
      created_at: social.createdAt.toISOString(),
      updated_at: social.updatedAt.toISOString(),
    })),
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString(),
  }),
  toDomain: (params: Selectable<UserTable> & { socials: Selectable<UserSocialTable>[] }) =>
    new User({
      id: params.id,
      email: params.email,
      authorities: params.authorities,
      birthday: params.birthday ?? undefined,
      firstName: params.first_name,
      lastName: params.last_name,
      isEnabled: params.is_enabled,
      lastIp: params.last_ip ?? undefined,
      lastConnectedAt: params.last_connected_at ?? undefined,
      passwordEnc: params.password_enc ?? undefined,
      pictureUrl: params.picture_url ?? undefined,
      socials: params.socials.map(social => UserSocialMapper.toDomain(social)),
      createdAt: new Date(params.created_at),
      updatedAt: new Date(params.updated_at),
    }),
  toInsertable(user: User): Insertable<UserTable> {
    return {
      id: user.id,
      email: user.email,
      authorities: user.authorities,
      birthday: user.birthday,
      picture_url: user.pictureUrl,
      first_name: user.firstName,
      last_name: user.lastName,
      is_enabled: user.isEnabled,
      last_connected_at: user.lastConnectedAt,
      updated_at: user.updatedAt,
      created_at: user.createdAt,
      last_ip: user.lastIp,
      password_enc: user.passwordEnc,
    }
  },
}

export const UserSocialMapper = {
  toDomain: (params: Selectable<UserSocialTable>) =>
    new UserSocial({
      id: params.id,
      userId: params.user_id,
      externalProviderId: params.social_id,
      socialType: params.social_type,
      pictureUrl: params.picture_url ?? undefined,
      createdAt: new Date(params.created_at),
      updatedAt: new Date(params.updated_at),
    }),
  toInsertable(social: UserSocial): Insertable<UserSocialTable> {
    return {
      id: social.id,
      social_id: social.externalProviderId,
      social_type: social.socialType,
      picture_url: social.pictureUrl,
      user_id: social.userId,
      created_at: social.createdAt,
      updated_at: social.updatedAt,
    }
  },
}

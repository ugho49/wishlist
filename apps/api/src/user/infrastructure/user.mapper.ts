import type { User, UserSocial } from '../domain'

import {
  Authorities,
  type MiniUserDto,
  type UserDto,
  type UserSocialDto,
  type UserWithoutSocialsDto,
} from '@wishlist/common'
import { DateTime } from 'luxon'
import { match } from 'ts-pattern'

import {
  User as GqlUser,
  UserAuthorities as GqlUserAuthorities,
  UserFull as GqlUserFull,
  UserSocial as GqlUserSocial,
} from '../../gql/generated-types'

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

function toGqlUser(user: User): GqlUser {
  return {
    __typename: 'User',
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    pictureUrl: user.pictureUrl,
    birthday: user.birthday ? DateTime.fromJSDate(user.birthday).toISODate() || '' : undefined,
    isEnabled: user.isEnabled,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

function toGqlUserFull(user: User): GqlUserFull {
  const authorities: GqlUserAuthorities[] = user.authorities.map(authority => {
    const gqlAuthority = match(authority)
      .with(Authorities.ROLE_USER, () => GqlUserAuthorities.RoleUser)
      .with(Authorities.ROLE_ADMIN, () => GqlUserAuthorities.RoleAdmin)
      .with(Authorities.ROLE_SUPERADMIN, () => GqlUserAuthorities.RoleSuperadmin)
      .exhaustive()

    return gqlAuthority
  })

  return {
    ...toGqlUser(user),
    __typename: 'UserFull',
    authorities,
    isEnabled: user.isEnabled,
    lastConnectedAt: user.lastConnectedAt?.toISOString(),
    lastIp: user.lastIp,
  }
}

function toGqlUserSocial(social: UserSocial): GqlUserSocial {
  return {
    __typename: 'UserSocial',
    id: social.id,
    email: social.email,
    name: social.name,
    socialType: social.socialType,
    pictureUrl: social.pictureUrl,
    createdAt: social.createdAt.toISOString(),
    updatedAt: social.updatedAt.toISOString(),
  }
}

export const userMapper = {
  toMiniUserDto,
  toUserWithoutSocialsDto,
  toUserDto,
  toUserSocialDto,
  toGqlUser,
  toGqlUserFull,
  toGqlUserSocial,
}

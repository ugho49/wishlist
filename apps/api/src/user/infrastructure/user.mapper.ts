import type { User } from '../domain/model/user.model';
import type { UserSocial } from '../domain/model/user-social.model';

import { Authorities, type MiniUserDto, type UserSocialDto } from '@wishlist/common';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import {
  type User as GqlUser,
  UserAuthorities as GqlUserAuthorities,
  type UserFull as GqlUserFull,
  type UserSocial as GqlUserSocial,
} from '../../gql/generated-types';

function toMiniUserDto(model: User): MiniUserDto {
  return {
    id: model.id,
    firstname: model.firstName,
    lastname: model.lastName,
    email: model.email,
    picture_url: model.pictureUrl,
  };
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
  };
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
  };
}

function toGqlUserFull(user: User): GqlUserFull {
  const authorities: GqlUserAuthorities[] = user.authorities.map(authority => {
    const gqlAuthority = match(authority)
      .with(Authorities.ROLE_USER, () => GqlUserAuthorities.RoleUser)
      .with(Authorities.ROLE_ADMIN, () => GqlUserAuthorities.RoleAdmin)
      .with(Authorities.ROLE_SUPERADMIN, () => GqlUserAuthorities.RoleSuperadmin)
      .exhaustive();

    return gqlAuthority;
  });

  return {
    ...toGqlUser(user),
    __typename: 'UserFull',
    authorities,
    isEnabled: user.isEnabled,
    lastConnectedAt: user.lastConnectedAt?.toISOString(),
    lastIp: user.lastIp,
  };
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
  };
}

export const userMapper = {
  toMiniUserDto,
  toUserSocialDto,
  toGqlUser,
  toGqlUserFull,
  toGqlUserSocial,
};

import type { User } from '../domain/model/user.model';
import type { UserEmailSetting } from '../domain/model/user-email-setting.model';
import type { UserSocial } from '../domain/model/user-social.model';

import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import {
  type User as GqlUser,
  UserAuthorities as GqlUserAuthorities,
  type UserEmailSettings as GqlUserEmailSettings,
  type UserFull as GqlUserFull,
  type UserSocial as GqlUserSocial,
  UserSocialType as GqlUserSocialType,
} from '../../gql/generated-types';
import { Authorities } from '../domain/authorities.enum';
import { UserSocialType } from '../domain/user-social-type.enum';

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
  const socialType = match(social.socialType)
    .with(UserSocialType.GOOGLE, () => GqlUserSocialType.Google)
    .with(UserSocialType.FACEBOOK, () => GqlUserSocialType.Facebook)
    .exhaustive();

  return {
    __typename: 'UserSocial',
    id: social.id,
    email: social.email,
    name: social.name,
    socialType,
    pictureUrl: social.pictureUrl,
    createdAt: social.createdAt.toISOString(),
    updatedAt: social.updatedAt.toISOString(),
  };
}

function toGqlUserEmailSettings(userEmailSetting: UserEmailSetting): GqlUserEmailSettings {
  return {
    __typename: 'UserEmailSettings',
    dailyNewItemNotification: userEmailSetting.dailyNewItemNotification,
  };
}

export const userMapper = {
  toGqlUser,
  toGqlUserFull,
  toGqlUserSocial,
  toGqlUserEmailSettings,
};

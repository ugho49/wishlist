import type { User } from '../domain/model/user.model';
import type { UserAccount } from '../domain/model/user-account.model';
import type { UserEmailSetting } from '../domain/model/user-email-setting.model';
import type { UserRefreshToken } from '../domain/model/user-refresh-token.model';

import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import {
  type User as GqlUser,
  type UserAccount as GqlUserAccount,
  UserAccountProvider as GqlUserAccountProvider,
  UserAuthorities as GqlUserAuthorities,
  type UserEmailSettings as GqlUserEmailSettings,
  type UserFull as GqlUserFull,
  type UserSession as GqlUserSession,
} from '../../gql/generated-types';
import { Authorities } from '../domain/authorities.enum';
import { UserAccountProvider } from '../domain/user-account-provider.enum';

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
  };
}

function toGqlUserAccount(account: UserAccount): GqlUserAccount {
  const provider = match(account.provider)
    .with(UserAccountProvider.PASSWORD, () => GqlUserAccountProvider.Password)
    .with(UserAccountProvider.GOOGLE, () => GqlUserAccountProvider.Google)
    .with(UserAccountProvider.FACEBOOK, () => GqlUserAccountProvider.Facebook)
    .exhaustive();

  return {
    __typename: 'UserAccount',
    id: account.id,
    email: account.email,
    provider,
    pictureUrl: account.pictureUrl,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

function toGqlUserEmailSettings(userEmailSetting: UserEmailSetting): GqlUserEmailSettings {
  return {
    __typename: 'UserEmailSettings',
    dailyNewItemNotification: userEmailSetting.dailyNewItemNotification,
  };
}

function toGqlUserSession(session: UserRefreshToken): GqlUserSession {
  return {
    __typename: 'UserSession',
    id: session.id,
    ip: session.ip,
    userAgent: session.userAgent,
    createdAt: session.createdAt.toISOString(),
    lastUsedAt: session.lastUsedAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
  };
}

export const userMapper = {
  toGqlUser,
  toGqlUserFull,
  toGqlUserAccount,
  toGqlUserEmailSettings,
  toGqlUserSession,
};

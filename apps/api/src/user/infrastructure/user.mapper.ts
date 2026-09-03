import type { User } from '../domain/model/user.model';
import type { UserAccount } from '../domain/model/user-account.model';
import type { UserEmailSetting } from '../domain/model/user-email-setting.model';
import type { UserSession } from '../domain/model/user-session.model';

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
  type UserSessionDevice as GqlUserSessionDevice,
  UserSessionDeviceType as GqlUserSessionDeviceType,
} from '../../gql/generated-types';
import { Authorities } from '../domain/authorities.enum';
import { UserAccountProvider } from '../domain/user-account-provider.enum';
import { UserSessionDeviceType } from '../domain/user-session-device-type.enum';

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

function toGqlUserSessionDevice(session: UserSession): GqlUserSessionDevice {
  const type = match(session.deviceType)
    .with(UserSessionDeviceType.MOBILE, () => GqlUserSessionDeviceType.Mobile)
    .with(UserSessionDeviceType.TABLET, () => GqlUserSessionDeviceType.Tablet)
    .with(UserSessionDeviceType.DESKTOP, () => GqlUserSessionDeviceType.Desktop)
    .with(UserSessionDeviceType.UNKNOWN, () => GqlUserSessionDeviceType.Unknown)
    .exhaustive();

  return {
    __typename: 'UserSessionDevice',
    browser: session.browser,
    browserVersion: session.browserVersion,
    os: session.os,
    osVersion: session.osVersion,
    type,
    vendor: session.vendor,
    model: session.model,
    label: session.label,
  };
}

function toGqlUserSession(session: UserSession): GqlUserSession {
  return {
    __typename: 'UserSession',
    id: session.id,
    ip: session.ip,
    device: toGqlUserSessionDevice(session),
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

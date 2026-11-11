import type { BatchLoad } from '@znight/graphql';

import { type UserAccountId, type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';

import { type User, type UserAccount, type UserFull, type UserSession } from '../../gql/generated-types';
import { GetUserAccountsByIdsUseCase } from '../application/query/get-user-accounts-by-ids.use-case';
import { GetUserAccountsByUserIdsUseCase } from '../application/query/get-user-accounts-by-user-ids.use-case';
import { GetUserSessionsByUserIdsUseCase } from '../application/query/get-user-sessions-by-user-ids.use-case';
import { GetUsersByIdsUseCase } from '../application/query/get-users-by-ids.use-case';
import { userMapper } from './user.mapper';

@Injectable()
export class UsersById implements BatchLoad<UserId, User | null> {
  constructor(private readonly getUsersByIdsUseCase: GetUsersByIdsUseCase) {}

  async load(userIds: readonly UserId[]): Promise<readonly (User | null)[]> {
    const users = await this.getUsersByIdsUseCase.execute({ userIds: [...userIds] });
    const userMap = new Map(users.map(user => [user.id, userMapper.toGqlUser(user)]));
    return userIds.map(id => userMap.get(id) ?? null);
  }
}

@Injectable()
export class UsersFullById implements BatchLoad<UserId, UserFull | null> {
  constructor(private readonly getUsersByIdsUseCase: GetUsersByIdsUseCase) {}

  async load(userIds: readonly UserId[]): Promise<readonly (UserFull | null)[]> {
    const users = await this.getUsersByIdsUseCase.execute({ userIds: [...userIds] });
    const userMap = new Map(users.map(user => [user.id, userMapper.toGqlUserFull(user)]));
    return userIds.map(id => userMap.get(id) ?? null);
  }
}

@Injectable()
export class UserAccountsByUserId implements BatchLoad<UserId, UserAccount[]> {
  constructor(private readonly getUserAccountsByUserIdsUseCase: GetUserAccountsByUserIdsUseCase) {}

  async load(userIds: readonly UserId[]): Promise<readonly UserAccount[][]> {
    const userAccountMap = await this.getUserAccountsByUserIdsUseCase.execute({ userIds: [...userIds] });
    return userIds.map(id =>
      (userAccountMap.get(id) ?? []).map(userAccount => userMapper.toGqlUserAccount(userAccount)),
    );
  }
}

@Injectable()
export class UserAccountsById implements BatchLoad<UserAccountId, UserAccount | null> {
  constructor(private readonly getUserAccountsByIdsUseCase: GetUserAccountsByIdsUseCase) {}

  async load(userAccountIds: readonly UserAccountId[]): Promise<readonly (UserAccount | null)[]> {
    const userAccounts = await this.getUserAccountsByIdsUseCase.execute({ userAccountIds: [...userAccountIds] });
    const userAccountMap = new Map(
      userAccounts.map(userAccount => [userAccount.id, userMapper.toGqlUserAccount(userAccount)]),
    );
    return userAccountIds.map(id => userAccountMap.get(id) ?? null);
  }
}

@Injectable()
export class UserSessionsByUserId implements BatchLoad<UserId, UserSession[]> {
  constructor(private readonly getUserSessionsByUserIdsUseCase: GetUserSessionsByUserIdsUseCase) {}

  async load(userIds: readonly UserId[]): Promise<readonly UserSession[][]> {
    const sessionMap = await this.getUserSessionsByUserIdsUseCase.execute({ userIds: [...userIds] });
    return userIds.map(id => (sessionMap.get(id) ?? []).map(session => userMapper.toGqlUserSession(session)));
  }
}

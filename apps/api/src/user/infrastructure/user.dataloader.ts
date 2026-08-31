import { Injectable } from '@nestjs/common';
import { type UserAccountId, type UserId } from '@wishlist/common';
import DataLoader from 'dataloader';

import { type User, type UserAccount, type UserFull, type UserSession } from '../../gql/generated-types';
import { GetUserAccountsByIdsUseCase } from '../application/query/get-user-accounts-by-ids.use-case';
import { GetUserAccountsByUserIdsUseCase } from '../application/query/get-user-accounts-by-user-ids.use-case';
import { GetUserSessionsByUserIdsUseCase } from '../application/query/get-user-sessions-by-user-ids.use-case';
import { GetUsersByIdsUseCase } from '../application/query/get-users-by-ids.use-case';
import { userMapper } from './user.mapper';

@Injectable()
export class UserDataLoaderFactory {
  constructor(
    private readonly getUsersByIdsUseCase: GetUsersByIdsUseCase,
    private readonly getUserAccountsByUserIdsUseCase: GetUserAccountsByUserIdsUseCase,
    private readonly getUserAccountsByIdsUseCase: GetUserAccountsByIdsUseCase,
    private readonly getUserSessionsByUserIdsUseCase: GetUserSessionsByUserIdsUseCase,
  ) {}

  createUserLoader() {
    return new DataLoader<UserId, User | null>(async (userIds: readonly UserId[]) => {
      const users = await this.getUsersByIdsUseCase.execute({ userIds: [...userIds] });
      const userMap = new Map(users.map(user => [user.id, userMapper.toGqlUser(user)]));
      return userIds.map(id => userMap.get(id) ?? null);
    });
  }

  createUserFullLoader() {
    return new DataLoader<UserId, UserFull | null>(async (userIds: readonly UserId[]) => {
      const users = await this.getUsersByIdsUseCase.execute({ userIds: [...userIds] });
      const userMap = new Map(users.map(user => [user.id, userMapper.toGqlUserFull(user)]));
      return userIds.map(id => userMap.get(id) ?? null);
    });
  }

  createUserAccountsByUserLoader() {
    return new DataLoader<UserId, UserAccount[]>(async (userIds: readonly UserId[]) => {
      const userAccountMap = await this.getUserAccountsByUserIdsUseCase.execute({ userIds: [...userIds] });
      return userIds.map(id =>
        (userAccountMap.get(id) ?? []).map(userAccount => userMapper.toGqlUserAccount(userAccount)),
      );
    });
  }

  createUserAccountLoader() {
    return new DataLoader<UserAccountId, UserAccount | null>(async (userAccountIds: readonly UserAccountId[]) => {
      const userAccounts = await this.getUserAccountsByIdsUseCase.execute({ userAccountIds: [...userAccountIds] });
      const userAccountMap = new Map(
        userAccounts.map(userAccount => [userAccount.id, userMapper.toGqlUserAccount(userAccount)]),
      );
      return userAccountIds.map(id => userAccountMap.get(id) ?? null);
    });
  }

  createUserSessionsByUserLoader() {
    return new DataLoader<UserId, UserSession[]>(async (userIds: readonly UserId[]) => {
      const sessionMap = await this.getUserSessionsByUserIdsUseCase.execute({ userIds: [...userIds] });
      return userIds.map(id => (sessionMap.get(id) ?? []).map(session => userMapper.toGqlUserSession(session)));
    });
  }
}

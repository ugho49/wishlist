import { Injectable } from '@nestjs/common'
import { UserId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { GetUserSocialsByUserIdsUseCase } from '../application/query/get-user-socials-by-user-ids.use-case'
import { GetUsersByIdsUseCase } from '../application/query/get-users-by-ids.use-case'
import { GqlUser, GqlUserSocial } from './user.dto'
import { userMapper } from './user.mapper'

@Injectable()
export class UserDataLoaderFactory {
  constructor(
    private readonly getUsersByIdsUseCase: GetUsersByIdsUseCase,
    private readonly getUserSocialsByUserIdsUseCase: GetUserSocialsByUserIdsUseCase,
  ) {}

  createUserLoader() {
    return new DataLoader<UserId, GqlUser | null>(async (userIds: readonly UserId[]) => {
      const users = await this.getUsersByIdsUseCase.execute({ userIds: [...userIds] })
      const userMap = new Map(users.map(user => [user.id, userMapper.toGqlUser(user)]))
      return userIds.map(id => userMap.get(id) ?? null)
    })
  }

  createUserSocialLoader() {
    return new DataLoader<UserId, GqlUserSocial[]>(async (userIds: readonly UserId[]) => {
      const userSocialMap = await this.getUserSocialsByUserIdsUseCase.execute({ userIds: [...userIds] })
      return userIds.map(id => (userSocialMap.get(id) ?? []).map(userSocial => userMapper.toGqlUserSocial(userSocial)))
    })
  }
}

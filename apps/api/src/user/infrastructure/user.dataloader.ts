import { Injectable } from '@nestjs/common'
import { UserId, UserSocialId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { GetUserSocialsByIdsUseCase } from '../application/query/get-user-socials-by-ids.use-case'
import { GetUserSocialsByUserIdsUseCase } from '../application/query/get-user-socials-by-user-ids.use-case'
import { GetUsersByIdsUseCase } from '../application/query/get-users-by-ids.use-case'
import { GqlUser, GqlUserSocial } from './user.dto'
import { userMapper } from './user.mapper'

@Injectable()
export class UserDataLoaderFactory {
  constructor(
    private readonly getUsersByIdsUseCase: GetUsersByIdsUseCase,
    private readonly getUserSocialsByUserIdsUseCase: GetUserSocialsByUserIdsUseCase,
    private readonly getUserSocialsByIdsUseCase: GetUserSocialsByIdsUseCase,
  ) {}

  createUserLoader() {
    return new DataLoader<UserId, GqlUser | null>(async (userIds: readonly UserId[]) => {
      const users = await this.getUsersByIdsUseCase.execute({ userIds: [...userIds] })
      const userMap = new Map(users.map(user => [user.id, userMapper.toGqlUser(user)]))
      return userIds.map(id => userMap.get(id) ?? null)
    })
  }

  createUserSocialsByUserLoader() {
    return new DataLoader<UserId, GqlUserSocial[]>(async (userIds: readonly UserId[]) => {
      const userSocialMap = await this.getUserSocialsByUserIdsUseCase.execute({ userIds: [...userIds] })
      return userIds.map(id => (userSocialMap.get(id) ?? []).map(userSocial => userMapper.toGqlUserSocial(userSocial)))
    })
  }

  createUserSocialLoader() {
    return new DataLoader<UserSocialId, GqlUserSocial | null>(async (userSocialIds: readonly UserSocialId[]) => {
      const userSocials = await this.getUserSocialsByIdsUseCase.execute({ userSocialIds: [...userSocialIds] })
      const userSocialMap = new Map(
        userSocials.map(userSocial => [userSocial.id, userMapper.toGqlUserSocial(userSocial)]),
      )
      return userSocialIds.map(id => userSocialMap.get(id) ?? null)
    })
  }
}

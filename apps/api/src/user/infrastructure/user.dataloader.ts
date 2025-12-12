import { Injectable } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { UserId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { GetUserSocialsByUserIdsQuery, GetUsersByIdsQuery } from '../domain'
import { GqlUser, GqlUserSocial } from './user.dto'
import { userMapper } from './user.mapper'

@Injectable()
export class UserDataLoaderFactory {
  constructor(private readonly queryBus: QueryBus) {}

  createUserLoader() {
    return new DataLoader<UserId, GqlUser | null>(async (userIds: readonly UserId[]) => {
      const users = await this.queryBus.execute(new GetUsersByIdsQuery({ userIds: [...userIds] }))
      const userMap = new Map(users.map(user => [user.id, userMapper.toGqlUser(user)]))
      return userIds.map(id => userMap.get(id) ?? null)
    })
  }

  createUserSocialLoader() {
    return new DataLoader<UserId, GqlUserSocial[]>(async (userIds: readonly UserId[]) => {
      const userSocialMap = await this.queryBus.execute(new GetUserSocialsByUserIdsQuery({ userIds: [...userIds] }))
      return userIds.map(id => (userSocialMap.get(id) ?? []).map(userSocial => userMapper.toGqlUserSocial(userSocial)))
    })
  }
}

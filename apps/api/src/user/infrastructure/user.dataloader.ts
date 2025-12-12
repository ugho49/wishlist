import { Injectable, Logger } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { UserId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { GetUsersByIdsQuery } from '../domain'
import { UserOutput } from './user.dto'
import { userMapper } from './user.mapper'

@Injectable()
export class UserDataLoaderFactory {
  private readonly logger = new Logger(UserDataLoaderFactory.name)

  constructor(private readonly queryBus: QueryBus) {}

  createLoader() {
    return new DataLoader<UserId, UserOutput | null>(async (userIds: readonly UserId[]) => {
      if (userIds.length === 0) return userIds.map(() => null)
      this.logger.log('Loading users', { userIds })
      const users = await this.queryBus.execute(new GetUsersByIdsQuery({ userIds: [...userIds] }))
      const userMap = new Map(users.map(user => [user.id, userMapper.toUserOutput(user)]))
      return userIds.map(id => userMap.get(id) ?? null)
    })
  }
}

import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { MiniUserDto, UserId } from '@wishlist/common'

import { UserRepository } from '../../domain'
import { userMapper } from '../../infrastructure'

const MAX_LIMIT = 50

export type GetClosestFriendsInput = {
  userId: UserId
  limit: number
}

@Injectable()
export class GetClosestFriendsUseCase {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetClosestFriendsInput): Promise<MiniUserDto[]> {
    const { userId, limit } = query

    if (limit > MAX_LIMIT) {
      throw new BadRequestException(`Limit cannot be greater than ${MAX_LIMIT}`)
    }

    const closestFriends = await this.userRepository.findClosestFriends(userId, limit)

    return closestFriends.map(user => userMapper.toMiniUserDto(user))
  }
}

import { BadRequestException, Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { GetClosestFriendsQuery, GetClosestFriendsResult, UserRepository } from '../../domain'
import { userMapper } from '../../infrastructure'

const MAX_LIMIT = 50

@QueryHandler(GetClosestFriendsQuery)
export class GetClosestFriendsUseCase implements IInferredQueryHandler<GetClosestFriendsQuery> {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetClosestFriendsQuery): Promise<GetClosestFriendsResult> {
    const { userId, limit } = query

    if (limit > MAX_LIMIT) {
      throw new BadRequestException(`Limit cannot be greater than ${MAX_LIMIT}`)
    }

    const closestFriends = await this.userRepository.findClosestFriends(userId, limit)

    return closestFriends.map(user => userMapper.toMiniUserDto(user))
  }
}

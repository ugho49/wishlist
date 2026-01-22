import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserId } from '@wishlist/common'

import {
  GetUserSocialsByUserIdsQuery,
  GetUserSocialsByUserIdsResult,
  UserSocial,
  UserSocialRepository,
} from '../../domain'

@QueryHandler(GetUserSocialsByUserIdsQuery)
export class GetUserSocialsByUserIdsUseCase implements IInferredQueryHandler<GetUserSocialsByUserIdsQuery> {
  constructor(
    @Inject(REPOSITORIES.USER_SOCIAL)
    private readonly userSocialRepository: UserSocialRepository,
  ) {}

  async execute(query: GetUserSocialsByUserIdsQuery): Promise<GetUserSocialsByUserIdsResult> {
    const userSocials = await this.userSocialRepository.findByUserIds(query.userIds)

    return userSocials.reduce((acc, userSocial) => {
      if (!acc.has(userSocial.user.id)) {
        acc.set(userSocial.user.id, [])
      }
      acc.get(userSocial.user.id)?.push(userSocial)
      return acc
    }, new Map<UserId, UserSocial[]>())
  }
}

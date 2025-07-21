import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { USER_REPOSITORY, USER_SOCIAL_REPOSITORY } from '@wishlist/api/repositories'

import { GetUserByIdQuery, GetUserByIdResult, UserRepository, UserSocialRepository } from '../../domain'
import { userMapper } from '../../infrastructure'

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdUseCase implements IInferredQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(USER_SOCIAL_REPOSITORY)
    private readonly userSocialRepository: UserSocialRepository,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<GetUserByIdResult> {
    const user = await this.userRepository.findByIdOrFail(query.userId)
    const socials = await this.userSocialRepository.findByUserId(query.userId)

    return userMapper.toUserDto({ user, socials })
  }
}

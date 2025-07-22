import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { GetUserByIdQuery, GetUserByIdResult, UserRepository, UserSocialRepository } from '../../domain'
import { userMapper } from '../../infrastructure'

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdUseCase implements IInferredQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_SOCIAL)
    private readonly userSocialRepository: UserSocialRepository,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<GetUserByIdResult> {
    const user = await this.userRepository.findByIdOrFail(query.userId)
    const socials = await this.userSocialRepository.findByUserId(query.userId)

    return userMapper.toUserDto({ user, socials })
  }
}

import { Inject, Injectable } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserDto, UserId } from '@wishlist/common'

import { UserRepository, UserSocialRepository } from '../../domain'
import { userMapper } from '../../infrastructure'

export type GetUserByIdInput = {
  userId: UserId
}

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_SOCIAL)
    private readonly userSocialRepository: UserSocialRepository,
  ) {}

  async execute(query: GetUserByIdInput): Promise<UserDto> {
    const user = await this.userRepository.findByIdOrFail(query.userId)
    const socials = await this.userSocialRepository.findByUserId(query.userId)

    return userMapper.toUserDto({ user, socials })
  }
}

import { Inject, Injectable } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { type UserSocialId } from '@wishlist/common'

import { UserSocial, type UserSocialRepository } from '../../domain'

export type GetUserSocialsByIdsInput = {
  userSocialIds: UserSocialId[]
}

@Injectable()
export class GetUserSocialsByIdsUseCase {
  constructor(
    @Inject(REPOSITORIES.USER_SOCIAL)
    private readonly userSocialRepository: UserSocialRepository,
  ) {}

  execute(input: GetUserSocialsByIdsInput): Promise<UserSocial[]> {
    return this.userSocialRepository.findByIds(input.userSocialIds)
  }
}

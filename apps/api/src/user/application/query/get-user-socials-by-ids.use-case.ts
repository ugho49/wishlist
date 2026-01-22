import { Inject, Injectable } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserSocialId } from '@wishlist/common'

import { UserSocial, UserSocialRepository } from '../../domain'

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

import { Inject, Injectable } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserId } from '@wishlist/common'

import { User, UserRepository } from '../../domain'

export type GetUsersByIdsInput = {
  userIds: UserId[]
}

@Injectable()
export class GetUsersByIdsUseCase {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  execute(query: GetUsersByIdsInput): Promise<User[]> {
    return this.userRepository.findByIds(query.userIds)
  }
}

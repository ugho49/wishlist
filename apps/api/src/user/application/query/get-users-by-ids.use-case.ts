import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { GetUsersByIdsQuery, User, UserRepository } from '../../domain'

@QueryHandler(GetUsersByIdsQuery)
export class GetUsersByIdsUseCase implements IInferredQueryHandler<GetUsersByIdsQuery> {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  execute(query: GetUsersByIdsQuery): Promise<User[]> {
    return this.userRepository.findByIds(query.userIds)
  }
}

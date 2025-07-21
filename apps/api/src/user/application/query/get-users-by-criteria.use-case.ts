import { BadRequestException, Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { USER_REPOSITORY } from '@wishlist/api/repositories'
import { isEmpty } from 'lodash'

import { GetUsersByCriteriaQuery, GetUsersByCriteriaResult, UserRepository } from '../../domain'
import { userMapper } from '../../infrastructure'

@QueryHandler(GetUsersByCriteriaQuery)
export class GetUsersByCriteriaUseCase implements IInferredQueryHandler<GetUsersByCriteriaQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetUsersByCriteriaQuery): Promise<GetUsersByCriteriaResult> {
    const { criteria } = query

    if (isEmpty(criteria) || criteria.trim().length < 2) {
      throw new BadRequestException('Invalid search criteria')
    }

    const users = await this.userRepository.findAllByCriteria({
      criteria,
      ignoreUserId: query.currentUser.id,
      limit: 10,
    })

    return users.map(user => userMapper.toMiniUserDto(user))
  }
}

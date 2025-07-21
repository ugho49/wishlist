import { BadRequestException, Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { DEFAULT_RESULT_NUMBER } from '@wishlist/api/core'
import { USER_REPOSITORY } from '@wishlist/api/repositories'
import { createPagedResponse } from '@wishlist/common'

import { GetUsersPaginatedQuery, GetUsersPaginatedResult, UserRepository } from '../../domain'
import { userMapper } from '../../infrastructure'

@QueryHandler(GetUsersPaginatedQuery)
export class GetUsersPaginatedUseCase implements IInferredQueryHandler<GetUsersPaginatedQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetUsersPaginatedQuery): Promise<GetUsersPaginatedResult> {
    const { criteria, pageNumber } = query
    const pageSize = DEFAULT_RESULT_NUMBER
    const skip = pageSize * (pageNumber - 1)

    if (criteria && criteria.trim().length < 2) {
      throw new BadRequestException('Invalid search criteria')
    }

    const { users, totalCount } = await this.userRepository.findAllPaginated({
      criteria,
      pagination: { take: pageSize, skip },
    })

    return createPagedResponse({
      resources: users.map(user => userMapper.toUserWithoutSocialsDto(user)),
      options: { pageSize, totalElements: totalCount, pageNumber },
    })
  }
}

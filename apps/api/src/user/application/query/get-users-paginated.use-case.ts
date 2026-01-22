import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { DEFAULT_RESULT_NUMBER } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { createPagedResponse, PagedResponse, UserWithoutSocialsDto } from '@wishlist/common'

import { UserRepository } from '../../domain'
import { userMapper } from '../../infrastructure'

export type GetUsersPaginatedInput = {
  criteria?: string
  pageNumber: number
}

@Injectable()
export class GetUsersPaginatedUseCase {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetUsersPaginatedInput): Promise<PagedResponse<UserWithoutSocialsDto>> {
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

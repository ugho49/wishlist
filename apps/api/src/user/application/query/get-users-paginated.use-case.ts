import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { User, UserRepository } from '../../domain'

export type GetUsersPaginatedInput = {
  criteria?: string
  pageNumber: number
  pageSize: number
}

export type GetUsersPaginatedOutput = {
  users: User[]
  totalCount: number
}

@Injectable()
export class GetUsersPaginatedUseCase {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetUsersPaginatedInput): Promise<GetUsersPaginatedOutput> {
    const { criteria, pageNumber, pageSize } = query
    const skip = pageSize * (pageNumber - 1)

    if (criteria && criteria.trim().length < 2) {
      throw new BadRequestException('Invalid search criteria')
    }

    const { users, totalCount } = await this.userRepository.findAllPaginated({
      criteria,
      pagination: { take: pageSize, skip },
    })

    return {
      users,
      totalCount,
    }
  }
}

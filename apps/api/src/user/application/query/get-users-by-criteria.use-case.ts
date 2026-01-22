import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { ICurrentUser, MiniUserDto } from '@wishlist/common'
import { isEmpty } from 'lodash'

import { UserRepository } from '../../domain'
import { userMapper } from '../../infrastructure'

export type GetUsersByCriteriaInput = {
  currentUser: ICurrentUser
  criteria: string
}

@Injectable()
export class GetUsersByCriteriaUseCase {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetUsersByCriteriaInput): Promise<MiniUserDto[]> {
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

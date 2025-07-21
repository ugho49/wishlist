import { BadRequestException, Injectable } from '@nestjs/common'
import { MiniUserDto, UserId } from '@wishlist/common'
import { isEmpty } from 'lodash'

import { toMiniUserDto } from './legacy-user.mapper'
import { LegacyUserRepository } from './legacy-user.repository'

/**
 * @deprecated
 */
@Injectable()
export class LegacyUserService {
  constructor(private readonly userRepository: LegacyUserRepository) {}

  async searchByKeyword(param: { currentUserId: UserId; criteria: string }): Promise<MiniUserDto[]> {
    const { criteria, currentUserId } = param

    if (isEmpty(criteria) || criteria.trim().length < 2) {
      throw new BadRequestException('Invalid search criteria')
    }

    const entities = await this.userRepository.searchByKeyword({ userId: currentUserId, keyword: criteria })

    return entities.map(entity => toMiniUserDto(entity))
  }
}

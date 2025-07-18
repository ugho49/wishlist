import { Injectable } from '@nestjs/common'
import { createPagedResponse, PagedResponse, UserId, WishlistWithEventsDto } from '@wishlist/common'

import { DEFAULT_RESULT_NUMBER } from '../../core/common'
import { LegacyWishlistRepository } from './legacy-wishlist.repository'
import { toWishlistWithEventsDto } from './legay-wishlist.mapper'

@Injectable()
export class LegacyWishlistService {
  constructor(private readonly wishlistRepository: LegacyWishlistRepository) {}

  async getAllWishlistForUserPaginated(param: {
    userId: UserId
    pageNumber: number
  }): Promise<PagedResponse<WishlistWithEventsDto>> {
    const pageSize = DEFAULT_RESULT_NUMBER
    const { pageNumber, userId } = param
    const skip = pageSize * (pageNumber - 1)

    const [entities, totalElements] = await this.wishlistRepository.getAllWishlistForUserPaginated({
      ownerId: userId,
      take: pageSize,
      skip,
    })

    const dtos = await Promise.all(entities.map(entity => toWishlistWithEventsDto(entity)))

    return createPagedResponse({
      resources: dtos,
      options: { pageSize, totalElements, pageNumber },
    })
  }
}

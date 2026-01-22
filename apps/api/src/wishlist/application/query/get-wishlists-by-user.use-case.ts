import { Inject, Injectable } from '@nestjs/common'
import { DEFAULT_RESULT_NUMBER } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { createPagedResponse, PagedResponse, UserId } from '@wishlist/common'

import { Wishlist, WishlistRepository } from '../../domain'

export type GetWishlistsByUserInput = {
  userId: UserId
  pageNumber: number
  pageSize?: number
}

@Injectable()
export class GetWishlistsByUserUseCase {
  constructor(@Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository) {}

  async execute(input: GetWishlistsByUserInput): Promise<PagedResponse<Wishlist>> {
    const pageSize = input.pageSize ?? DEFAULT_RESULT_NUMBER
    const skip = (input.pageNumber - 1) * pageSize

    const { wishlists, totalCount } = await this.wishlistRepository.findByUserPaginated({
      userId: input.userId,
      pagination: { take: pageSize, skip },
    })

    return createPagedResponse({
      resources: wishlists,
      options: { pageSize, totalElements: totalCount, pageNumber: input.pageNumber },
    })
  }
}

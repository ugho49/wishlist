import { Inject, Injectable } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserId } from '@wishlist/common'

import { Wishlist, WishlistRepository } from '../../domain'

export type GetWishlistsByUserInput = {
  userId: UserId
  pageNumber: number
  pageSize: number
}

type GetWishlistsByUserResult = {
  wishlists: Wishlist[]
  totalCount: number
}

@Injectable()
export class GetWishlistsByUserUseCase {
  constructor(@Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository) {}

  async execute(input: GetWishlistsByUserInput): Promise<GetWishlistsByUserResult> {
    const pageSize = input.pageSize
    const skip = (input.pageNumber - 1) * pageSize

    const { wishlists, totalCount } = await this.wishlistRepository.findByUserPaginated({
      userId: input.userId,
      pagination: { take: pageSize, skip },
    })

    return {
      wishlists,
      totalCount,
    }
  }
}

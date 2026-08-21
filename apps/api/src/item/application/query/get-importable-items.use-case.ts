import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { type WishlistRepository } from '@wishlist/api/wishlist'
import { type UserId, type WishlistId } from '@wishlist/common'

import { WishlistItem, type WishlistItemRepository } from '../../domain'

export type GetImportableItemsInput = {
  userId: UserId
  wishlistId: WishlistId
}

@Injectable()
export class GetImportableItemsUseCase {
  constructor(
    @Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(query: GetImportableItemsInput): Promise<WishlistItem[]> {
    const { userId, wishlistId } = query
    const wishlist = await this.wishlistRepository.findByIdOrFail(wishlistId)

    if (!wishlist.isOwner(userId)) {
      throw new UnauthorizedException('You are not the owner of this wishlist')
    }

    return this.itemRepository.findImportableItems({ userId, wishlistId })
  }
}

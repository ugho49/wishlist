import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'
import { ItemDto, UserId, WishlistId } from '@wishlist/common'

import { WishlistItemRepository } from '../../domain'
import { itemMapper } from '../../infrastructure'

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

  async execute(query: GetImportableItemsInput): Promise<ItemDto[]> {
    const { userId, wishlistId } = query
    const wishlist = await this.wishlistRepository.findByIdOrFail(wishlistId)

    if (!wishlist.isOwner(userId)) {
      throw new UnauthorizedException('You are not the owner of this wishlist')
    }

    const items = await this.itemRepository.findImportableItems({ userId, wishlistId })
    return items.map(item => itemMapper.toDto({ item, displayUserAndSuggested: false }))
  }
}

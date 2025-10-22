import { Inject, UnauthorizedException } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'

import { GetImportableItemsQuery, GetImportableItemsResult, WishlistItemRepository } from '../../domain'
import { itemMapper } from '../../infrastructure'

@QueryHandler(GetImportableItemsQuery)
export class GetImportableItemsUseCase implements IInferredQueryHandler<GetImportableItemsQuery> {
  constructor(
    @Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(query: GetImportableItemsQuery): Promise<GetImportableItemsResult> {
    const { userId, wishlistId } = query
    const wishlist = await this.wishlistRepository.findByIdOrFail(wishlistId)

    if (!wishlist.isOwner(userId)) {
      throw new UnauthorizedException('You are not the owner of this wishlist')
    }

    const items = await this.itemRepository.findImportableItems({ userId, wishlistId })
    return items.map(item => itemMapper.toDto({ item, displayUserAndSuggested: false }))
  }
}

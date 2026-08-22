import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { type UserId, type WishlistId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { type WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import { WishlistItem } from '../../domain/wishlist-item.model';

export type GetImportableItemsInput = {
  userId: UserId;
  wishlistId: WishlistId;
};

@Injectable()
export class GetImportableItemsUseCase {
  constructor(
    @Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(query: GetImportableItemsInput): Promise<WishlistItem[]> {
    const { userId, wishlistId } = query;
    const wishlist = await this.wishlistRepository.findByIdOrFail(wishlistId);

    if (!wishlist.isOwner(userId)) {
      throw new UnauthorizedException('You are not the owner of this wishlist');
    }

    return this.itemRepository.findImportableItems({ userId, wishlistId });
  }
}

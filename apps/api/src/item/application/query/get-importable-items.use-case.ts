import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { type UserId, type WishlistId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { UnauthorizedException } from '@znight/http';

import { type WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import { WishlistItem } from '../../domain/wishlist-item.model';

export type GetImportableItemsInput = {
  userId: UserId;
  wishlistId: WishlistId;
};

@Injectable()
export class GetImportableItemsUseCase {
  constructor(
    private readonly itemRepository: WishlistItemRepository,
    private readonly wishlistRepository: WishlistRepository,
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

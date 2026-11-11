import type { ICurrentUser, WishlistId } from '@wishlist/common';
import type { WishlistItem } from '../../domain/wishlist-item.model';
import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';

export type GetItemsByWishlistsInput = {
  currentUser: ICurrentUser;
  wishlistIds: WishlistId[];
};

export type GetItemsByWishlistsOutput = {
  mappedItems: Map<WishlistId, WishlistItem[]>;
};

@Injectable()
export class GetItemsByWishlistsUseCase {
  private readonly logger = getLogger(GetItemsByWishlistsUseCase.name);

  constructor(private readonly itemRepository: WishlistItemRepository) {}

  async execute(input: GetItemsByWishlistsInput): Promise<GetItemsByWishlistsOutput> {
    this.logger.info('Get items by wishlists request received', { input });
    const items = await this.itemRepository.findByWishlistIds(input.wishlistIds);
    const itemsByWishlistId = new Map<WishlistId, WishlistItem[]>();

    for (const wishlistId of input.wishlistIds) {
      itemsByWishlistId.set(wishlistId, []);
    }

    for (const item of items) {
      itemsByWishlistId.get(item.wishlistId)?.push(item);
    }

    return { mappedItems: itemsByWishlistId };
  }
}

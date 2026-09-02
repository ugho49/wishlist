import type { WishlistItem } from '../domain/wishlist-item.model';

import { Injectable } from '@nestjs/common';
import { type ICurrentUser, type WishlistId } from '@wishlist/common';
import DataLoader from 'dataloader';

import { GetItemsByWishlistsUseCase } from '../application/query/get-items-by-wishlists.use-case';

@Injectable()
export class ItemDataLoaderFactory {
  constructor(private readonly getItemsByWishlistsUseCase: GetItemsByWishlistsUseCase) {}

  createLoaderByWishlists(currentUser: ICurrentUser) {
    return new DataLoader<WishlistId, WishlistItem[]>(async (wishlistIds: readonly WishlistId[]) => {
      const { mappedItems } = await this.getItemsByWishlistsUseCase.execute({
        currentUser,
        wishlistIds: [...wishlistIds],
      });

      // Map items to maintain order and length matching input IDs
      return wishlistIds.map(id => mappedItems.get(id) ?? []);
    });
  }
}

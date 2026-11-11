import type { BatchLoad } from '@znight/graphql';
import type { HttpContext } from '@znight/http';
import type { WishlistItem } from '../domain/wishlist-item.model';

import { type WishlistId } from '@wishlist/common';
import { Injectable } from '@znight/core';

import { requireCurrentUser } from '../../auth/infrastructure/auth.context';
import { GetItemsByWishlistsUseCase } from '../application/query/get-items-by-wishlists.use-case';

/** Items of each wishlist, as seen by the current user. */
@Injectable({ scope: 'request' })
export class ItemsByWishlistId implements BatchLoad<WishlistId, WishlistItem[]> {
  constructor(
    private readonly getItemsByWishlistsUseCase: GetItemsByWishlistsUseCase,
    private readonly http: HttpContext,
  ) {}

  async load(wishlistIds: readonly WishlistId[]): Promise<readonly WishlistItem[][]> {
    const { mappedItems } = await this.getItemsByWishlistsUseCase.execute({
      currentUser: requireCurrentUser(this.http),
      wishlistIds: [...wishlistIds],
    });

    // Map items to maintain order and length matching input IDs
    return wishlistIds.map(id => mappedItems.get(id) ?? []);
  }
}

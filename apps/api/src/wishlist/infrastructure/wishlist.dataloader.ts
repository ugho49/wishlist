import type { BatchLoad } from '@znight/graphql';
import type { HttpContext } from '@znight/http';

import { type WishlistId } from '@wishlist/common';
import { Injectable } from '@znight/core';

import { requireCurrentUser } from '../../auth/infrastructure/auth.context';
import { type Wishlist } from '../../gql/generated-types';
import { GetWishlistsByIdsUseCase } from '../application/query/get-wishlists-by-ids.use-case';
import { wishlistMapper } from './wishlist.mapper';

/** Wishlists by id, as seen by the current user (`null` when not visible). */
@Injectable({ scope: 'request' })
export class WishlistsById implements BatchLoad<WishlistId, Wishlist | null> {
  constructor(
    private readonly getWishlistsByIdsUseCase: GetWishlistsByIdsUseCase,
    private readonly http: HttpContext,
  ) {}

  async load(wishlistIds: readonly WishlistId[]): Promise<readonly (Wishlist | null)[]> {
    const wishlists = await this.getWishlistsByIdsUseCase.execute({
      currentUser: requireCurrentUser(this.http),
      wishlistIds: [...wishlistIds],
    });

    // Map wishlists to maintain order and length matching input IDs
    const wishlistMap = new Map(wishlists.map(w => [w.id, wishlistMapper.toGqlWishlist({ wishlist: w })]));

    return wishlistIds.map(id => wishlistMap.get(id) ?? null);
  }
}

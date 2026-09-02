import { Injectable } from '@nestjs/common';
import { type ICurrentUser, type WishlistId } from '@wishlist/common';
import DataLoader from 'dataloader';

import { type Wishlist } from '../../gql/generated-types';
import { GetWishlistsByIdsUseCase } from '../application/query/get-wishlists-by-ids.use-case';
import { wishlistMapper } from './wishlist.mapper';

@Injectable()
export class WishlistDataLoaderFactory {
  constructor(private readonly getWishlistsByIdsUseCase: GetWishlistsByIdsUseCase) {}

  createLoader(currentUser: ICurrentUser) {
    return new DataLoader<WishlistId, Wishlist | null>(async (wishlistIds: readonly WishlistId[]) => {
      const wishlists = await this.getWishlistsByIdsUseCase.execute({
        currentUser,
        wishlistIds: [...wishlistIds],
      });

      // Map wishlists to maintain order and length matching input IDs
      const wishlistMap = new Map(wishlists.map(w => [w.id, wishlistMapper.toGqlWishlist({ wishlist: w })]));

      return wishlistIds.map(id => wishlistMap.get(id) ?? null);
    });
  }
}

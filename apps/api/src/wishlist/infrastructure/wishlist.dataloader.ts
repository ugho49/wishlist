import { Injectable } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ICurrentUser, WishlistId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { GetWishlistsByIdsQuery } from '../domain'
import { GqlWishlist } from './wishlist.dto'
import { wishlistMapper } from './wishlist.mapper'

@Injectable()
export class WishlistDataLoaderFactory {
  constructor(private readonly queryBus: QueryBus) {}

  createLoader(getCurrentUser: () => ICurrentUser | undefined) {
    return new DataLoader<WishlistId, GqlWishlist | null>(async (wishlistIds: readonly WishlistId[]) => {
      const currentUser = getCurrentUser()

      // If no user, return null for all wishlists (DataLoader requires same length array)
      if (!currentUser) return wishlistIds.map(() => null)

      const wishlists = await this.queryBus.execute(
        new GetWishlistsByIdsQuery({ wishlistIds: [...wishlistIds], currentUser }),
      )

      // Map wishlists to maintain order and length matching input IDs
      const wishlistMap = new Map(
        wishlists.map(w => [w.id, wishlistMapper.toGqlWishlist({ wishlist: w, currentUserId: currentUser.id })]),
      )

      return wishlistIds.map(id => wishlistMap.get(id) ?? null)
    })
  }
}

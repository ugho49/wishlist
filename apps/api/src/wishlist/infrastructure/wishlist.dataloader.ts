import { Injectable } from '@nestjs/common'
import { ICurrentUser, WishlistId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { Wishlist } from '../../gql/generated-types'
import { GetWishlistsByIdsUseCase } from '../application/query/get-wishlists-by-ids.use-case'
import { wishlistMapper } from './wishlist.mapper'

@Injectable()
export class WishlistDataLoaderFactory {
  constructor(private readonly getWishlistsByIdsUseCase: GetWishlistsByIdsUseCase) {}

  createLoader(getCurrentUser: () => ICurrentUser | undefined) {
    return new DataLoader<WishlistId, Wishlist | null>(async (wishlistIds: readonly WishlistId[]) => {
      const currentUser = getCurrentUser()

      // If no user, return null for all wishlists (DataLoader requires same length array)
      if (!currentUser) return wishlistIds.map(() => null)

      const wishlists = await this.getWishlistsByIdsUseCase.execute({
        currentUser,
        wishlistIds: [...wishlistIds],
      })

      // Map wishlists to maintain order and length matching input IDs
      const wishlistMap = new Map(
        wishlists.map(w => [w.id, wishlistMapper.toGqlWishlist({ wishlist: w, currentUserId: currentUser.id })]),
      )

      return wishlistIds.map(id => wishlistMap.get(id) ?? null)
    })
  }
}

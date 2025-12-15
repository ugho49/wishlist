import { Injectable, Logger } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ICurrentUser, WishlistId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { GetWishlistsByIdsQuery } from '../domain'
import { WishlistOutput } from './wishlist.dto'
import { wishlistMapper } from './wishlist.mapper'

@Injectable()
export class WishlistDataLoaderFactory {
  private readonly logger = new Logger(WishlistDataLoaderFactory.name)

  constructor(private readonly queryBus: QueryBus) {}

  createLoader(getCurrentUser: () => ICurrentUser | undefined) {
    return new DataLoader<WishlistId, WishlistOutput | null>(async (wishlistIds: readonly WishlistId[]) => {
      const currentUser = getCurrentUser()

      // If no user, return null for all wishlists (DataLoader requires same length array)
      if (!currentUser) return wishlistIds.map(() => null)

      this.logger.log(`Loading wishlists for user ${currentUser.id}`, { wishlistIds })

      const wishlists = await this.queryBus.execute(
        new GetWishlistsByIdsQuery({ wishlistIds: [...wishlistIds], currentUser }),
      )

      // Map wishlists to maintain order and length matching input IDs
      const wishlistMap = new Map(
        wishlists.map(w => [w.id, wishlistMapper.toWishlistOutput({ wishlist: w, currentUserId: currentUser.id })]),
      )

      return wishlistIds.map(id => wishlistMap.get(id) ?? null)
    })
  }
}

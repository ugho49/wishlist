import type { DrizzleTransaction } from '@wishlist/api/core'
import type { EventId, UserId, WishlistId } from '@wishlist/common'

import type { Wishlist } from './wishlist.model'

export interface WishlistRepository {
  findById(wishlistId: WishlistId): Promise<Wishlist | undefined>
  findByEvent(eventId: EventId): Promise<Wishlist[]>
  findByOwner(userId: UserId): Promise<Wishlist[]>
  save(wishlist: Wishlist, tx?: DrizzleTransaction): Promise<void>
  delete(wishlistId: WishlistId, tx?: DrizzleTransaction): Promise<void>
}

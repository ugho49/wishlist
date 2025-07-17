import type { EventId, UserId, WishlistId } from '@wishlist/common'

import type { Wishlist } from './wishlist.model'

export interface WishlistRepository {
  findById(wishlistId: WishlistId): Promise<Wishlist | undefined>
  findByEvent(eventId: EventId): Promise<Wishlist[]>
  findByOwner(userId: UserId): Promise<Wishlist[]>
  save(wishlist: Wishlist): Promise<void>
  delete(wishlistId: WishlistId): Promise<void>
}

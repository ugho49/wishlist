import type { DrizzleTransaction } from '@wishlist/api/core'
import type { WishlistId, WishlistMessageId } from '@wishlist/common'
import type { WishlistMessage } from './wishlist-message.model'

export interface WishlistMessageRepository {
  newId(): WishlistMessageId
  findById(id: WishlistMessageId): Promise<WishlistMessage | undefined>
  findByIdOrFail(id: WishlistMessageId): Promise<WishlistMessage>
  findByWishlistId(wishlistId: WishlistId): Promise<WishlistMessage[]>
  save(message: WishlistMessage, tx?: DrizzleTransaction): Promise<void>
  delete(id: WishlistMessageId, tx?: DrizzleTransaction): Promise<void>
}

import type { DrizzleTransaction } from '@wishlist/api/core'
import type { UserId, WishlistId, WishlistMessageId } from '@wishlist/common'
import type { WishlistMessage } from './wishlist-message.model'

export interface WishlistMessageRepository {
  newId(): WishlistMessageId
  findById(id: WishlistMessageId): Promise<WishlistMessage | undefined>
  findByIdOrFail(id: WishlistMessageId): Promise<WishlistMessage>
  findByWishlistIdPaginated(params: {
    wishlistId: WishlistId
    cursor?: { createdAt: Date; id: WishlistMessageId }
    limit: number
  }): Promise<WishlistMessage[]>
  countUnreadMessages(params: { wishlistId: WishlistId; lastReadAt?: Date }): Promise<number>
  getLastReadAt(params: { userId: UserId; wishlistId: WishlistId }): Promise<Date | undefined>
  markAsRead(params: { userId: UserId; wishlistId: WishlistId }): Promise<void>
  save(message: WishlistMessage, tx?: DrizzleTransaction): Promise<void>
  delete(id: WishlistMessageId, tx?: DrizzleTransaction): Promise<void>
}

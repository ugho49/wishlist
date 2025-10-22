import type { DrizzleTransaction } from '@wishlist/api/core'
import type { ItemId, UserId, WishlistId } from '@wishlist/common'
import type { WishlistItem } from './wishlist-item.model'

export interface NewItemsForWishlist {
  wishlistId: WishlistId
  wishlistTitle: string
  ownerId: UserId
  ownerName: string
  nbNewItems: number
}

export interface WishlistItemRepository {
  newId(): ItemId
  findById(id: ItemId): Promise<WishlistItem | undefined>
  findByIdOrFail(id: ItemId): Promise<WishlistItem>
  findByWishlist(wishlistId: WishlistId): Promise<WishlistItem[]>
  findAllNewItems(since: Date): Promise<NewItemsForWishlist[]>
  findImportableItems(userId: UserId): Promise<WishlistItem[]>
  save(item: WishlistItem, tx?: DrizzleTransaction): Promise<void>
  delete(id: ItemId, tx?: DrizzleTransaction): Promise<void>
}

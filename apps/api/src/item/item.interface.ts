import type { UserId, WishlistId } from '@wishlist/common'

export interface NewItemsForWishlist {
  wishlistId: WishlistId
  wishlistTitle: string
  ownerId: UserId
  ownerName: string
  nbNewItems: number
}

import { UserId, WishlistId } from '@wishlist/common-types'

export interface NewItemsForWishlist {
  wishlistId: WishlistId
  wishlistTitle: string
  ownerId: UserId
  ownerName: string
  nbNewItems: number
}

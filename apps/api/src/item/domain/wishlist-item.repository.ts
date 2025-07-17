import type { WishlistId } from '@wishlist/common'

import type { WishlistItem } from './wishlist-item.model'

export interface WishlistItemRepository {
  findByWishlist(wishlistId: WishlistId): Promise<WishlistItem[]>
}

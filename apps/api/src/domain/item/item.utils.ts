import type { WishlistEntity } from '../wishlist/wishlist.entity'
import type { ItemEntity } from './item.entity'

export function showItem(param: { item: ItemEntity; currentUserId: string; wishlist: WishlistEntity }): boolean {
  const { item, currentUserId, wishlist } = param

  // With this option, we force items to be shown, even if they are suggested
  if (wishlist.hideItems === false) return true

  // If we are not the owner of the list, display all items
  if (wishlist.ownerId !== currentUserId) return true

  // In this case, current user is owner of the list
  // So we want to show him only the item that are not suggested
  return item.isSuggested === false
}

export function displayItemSensitiveInformations(param: { currentUserId: string; wishlist: WishlistEntity }): boolean {
  const { currentUserId, wishlist } = param

  // With this option, we force item to show the user and the suggested
  if (wishlist.hideItems === false) return true

  // If we are the owner of the list, we not want the information to be displayed
  return wishlist.ownerId !== currentUserId
}

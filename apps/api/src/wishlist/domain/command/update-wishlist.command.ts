import type { ICurrentUser, WishlistId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

type UpdateWishlist = {
  title: string
  description?: string
}

export class UpdateWishlistCommand extends Command<void> {
  public readonly currentUser: ICurrentUser
  public readonly wishlistId: WishlistId
  public readonly updateWishlist: UpdateWishlist

  constructor(props: { currentUser: ICurrentUser; wishlistId: WishlistId; updateWishlist: UpdateWishlist }) {
    super()
    this.currentUser = props.currentUser
    this.wishlistId = props.wishlistId
    this.updateWishlist = props.updateWishlist
  }
}

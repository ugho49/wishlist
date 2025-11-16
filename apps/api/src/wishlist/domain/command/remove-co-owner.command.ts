import type { ICurrentUser, WishlistId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class RemoveCoOwnerCommand extends Command<void> {
  public readonly currentUser: ICurrentUser
  public readonly wishlistId: WishlistId

  constructor(props: { currentUser: ICurrentUser; wishlistId: WishlistId }) {
    super()
    this.currentUser = props.currentUser
    this.wishlistId = props.wishlistId
  }
}

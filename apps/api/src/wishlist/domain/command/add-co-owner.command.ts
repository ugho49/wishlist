import type { ICurrentUser, UserId, WishlistId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class AddCoOwnerCommand extends Command<void> {
  public readonly currentUser: ICurrentUser
  public readonly wishlistId: WishlistId
  public readonly coOwnerId: UserId

  constructor(props: { currentUser: ICurrentUser; wishlistId: WishlistId; coOwnerId: UserId }) {
    super()
    this.currentUser = props.currentUser
    this.wishlistId = props.wishlistId
    this.coOwnerId = props.coOwnerId
  }
}

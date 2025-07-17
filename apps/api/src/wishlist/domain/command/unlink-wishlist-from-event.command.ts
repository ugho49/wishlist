import type { EventId, ICurrentUser, WishlistId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class UnlinkWishlistFromEventCommand extends Command<void> {
  public readonly currentUser: ICurrentUser
  public readonly wishlistId: WishlistId
  public readonly eventId: EventId

  constructor(props: { currentUser: ICurrentUser; wishlistId: WishlistId; eventId: EventId }) {
    super()
    this.currentUser = props.currentUser
    this.wishlistId = props.wishlistId
    this.eventId = props.eventId
  }
}

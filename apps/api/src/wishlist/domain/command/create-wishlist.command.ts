import type { DetailedWishlistDto, EventId, ICurrentUser } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

type NewWishlist = {
  title: string
  description?: string
  eventIds: EventId[]
  hideItems?: boolean
  imageFile?: Express.Multer.File
}

export type CreateWishlistResult = DetailedWishlistDto

export class CreateWishlistCommand extends Command<CreateWishlistResult> {
  public readonly currentUser: ICurrentUser
  public readonly newWishlist: NewWishlist

  constructor(props: { currentUser: ICurrentUser; newWishlist: NewWishlist }) {
    super()
    this.currentUser = props.currentUser
    this.newWishlist = props.newWishlist
  }
}

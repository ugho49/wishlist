import type { ICurrentUser, ItemDto, WishlistId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

type NewItem = {
  name: string
  description?: string
  score?: number
  url?: string
  pictureUrl?: string
}

export type CreateItemResult = ItemDto

export class CreateItemCommand extends Command<CreateItemResult> {
  public readonly currentUser: ICurrentUser
  public readonly wishlistId: WishlistId
  public readonly newItem: NewItem

  constructor(props: { currentUser: ICurrentUser; wishlistId: WishlistId; newItem: NewItem }) {
    super()
    this.currentUser = props.currentUser
    this.wishlistId = props.wishlistId
    this.newItem = props.newItem
  }
}

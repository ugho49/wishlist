import type { ICurrentUser, ItemId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

type UpdateItem = {
  name?: string
  description?: string
  score?: number
  url?: string
  pictureUrl?: string
}

export class UpdateItemCommand extends Command<void> {
  public readonly currentUser: ICurrentUser
  public readonly itemId: ItemId
  public readonly updateItem: UpdateItem

  constructor(props: { currentUser: ICurrentUser; itemId: ItemId; updateItem: UpdateItem }) {
    super()
    this.currentUser = props.currentUser
    this.itemId = props.itemId
    this.updateItem = props.updateItem
  }
}

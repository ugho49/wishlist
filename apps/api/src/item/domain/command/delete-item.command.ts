import type { ICurrentUser, ItemId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class DeleteItemCommand extends Command<DeleteItemResult> {
  public readonly currentUser: ICurrentUser
  public readonly itemId: ItemId

  constructor(props: { currentUser: ICurrentUser; itemId: ItemId }) {
    super()
    this.currentUser = props.currentUser
    this.itemId = props.itemId
  }
}

export type DeleteItemResult = void

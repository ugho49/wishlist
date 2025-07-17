import type { ICurrentUser, ItemId, ToggleItemOutputDto } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class ToggleItemCommand extends Command<ToggleItemResult> {
  public readonly currentUser: ICurrentUser
  public readonly itemId: ItemId

  constructor(props: { currentUser: ICurrentUser; itemId: ItemId }) {
    super()
    this.currentUser = props.currentUser
    this.itemId = props.itemId
  }
}

export type ToggleItemResult = ToggleItemOutputDto

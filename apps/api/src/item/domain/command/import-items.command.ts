import type { ICurrentUser, ItemDto, ItemId, WishlistId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export type ImportItemsResult = ItemDto[]

export class ImportItemsCommand extends Command<ImportItemsResult> {
  public readonly currentUser: ICurrentUser
  public readonly wishlistId: WishlistId
  public readonly sourceItemIds: ItemId[]

  constructor(props: { currentUser: ICurrentUser; wishlistId: WishlistId; sourceItemIds: ItemId[] }) {
    super()
    this.currentUser = props.currentUser
    this.wishlistId = props.wishlistId
    this.sourceItemIds = props.sourceItemIds
  }
}

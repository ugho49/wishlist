import type { ItemDto, UserId, WishlistId } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetImportableItemsResult = ItemDto[]

export class GetImportableItemsQuery extends Query<GetImportableItemsResult> {
  public readonly userId: UserId
  public readonly wishlistId: WishlistId

  constructor(props: { userId: UserId; wishlistId: WishlistId }) {
    super()
    this.userId = props.userId
    this.wishlistId = props.wishlistId
  }
}

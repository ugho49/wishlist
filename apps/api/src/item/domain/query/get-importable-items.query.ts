import type { ItemDto, UserId } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetImportableItemsResult = ItemDto[]

export class GetImportableItemsQuery extends Query<GetImportableItemsResult> {
  public readonly userId: UserId

  constructor(props: { userId: UserId }) {
    super()
    this.userId = props.userId
  }
}

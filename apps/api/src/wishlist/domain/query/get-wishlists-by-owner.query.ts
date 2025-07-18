import type { PagedResponse, UserId, WishlistWithEventsDto } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetWishlistsByOwnerResult = PagedResponse<WishlistWithEventsDto>

export class GetWishlistsByOwnerQuery extends Query<GetWishlistsByOwnerResult> {
  public readonly ownerId: UserId
  public readonly pageNumber: number
  public readonly pageSize?: number

  constructor(props: { ownerId: UserId; pageNumber: number; pageSize?: number }) {
    super()
    this.ownerId = props.ownerId
    this.pageNumber = props.pageNumber
    this.pageSize = props.pageSize
  }
}

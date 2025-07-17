import type { ICurrentUser, PagedResponse, UserId, WishlistWithEventsDto } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetAllWishlistsPaginatedResult = PagedResponse<WishlistWithEventsDto>

export class GetAllWishlistsPaginatedQuery extends Query<GetAllWishlistsPaginatedResult> {
  public readonly currentUser: ICurrentUser
  public readonly userId: UserId
  public readonly pageNumber: number

  constructor(props: { currentUser: ICurrentUser; userId: UserId; pageNumber: number }) {
    super()
    this.currentUser = props.currentUser
    this.userId = props.userId
    this.pageNumber = props.pageNumber
  }
}

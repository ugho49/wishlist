import type { ICurrentUser, PagedResponse, WishlistWithEventsDto } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetMyWishlistsResult = PagedResponse<WishlistWithEventsDto>

export class GetMyWishlistsQuery extends Query<GetMyWishlistsResult> {
  public readonly currentUser: ICurrentUser
  public readonly pageNumber: number

  constructor(props: { currentUser: ICurrentUser; pageNumber: number }) {
    super()
    this.currentUser = props.currentUser
    this.pageNumber = props.pageNumber
  }
}

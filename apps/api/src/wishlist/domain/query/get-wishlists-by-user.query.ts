import type { PagedResponse, UserId } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

import { Wishlist } from '../wishlist.model'

export type GetWishlistsByUserResult = PagedResponse<Wishlist>

export class GetWishlistsByUserQuery extends Query<GetWishlistsByUserResult> {
  public readonly userId: UserId
  public readonly pageNumber: number
  public readonly pageSize?: number

  constructor(props: { userId: UserId; pageNumber: number; pageSize?: number }) {
    super()
    this.userId = props.userId
    this.pageNumber = props.pageNumber
    this.pageSize = props.pageSize
  }
}

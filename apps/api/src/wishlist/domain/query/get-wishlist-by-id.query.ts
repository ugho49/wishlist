import type { DetailedWishlistDto, ICurrentUser, WishlistId } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetWishlistByIdResult = DetailedWishlistDto

export class GetWishlistByIdQuery extends Query<GetWishlistByIdResult> {
  public readonly currentUser: ICurrentUser
  public readonly wishlistId: WishlistId

  constructor(props: { currentUser: ICurrentUser; wishlistId: WishlistId }) {
    super()
    this.currentUser = props.currentUser
    this.wishlistId = props.wishlistId
  }
}

import type { ICurrentUser, WishlistId } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

import { Wishlist } from '../wishlist.model'

export class GetWishlistsByIdsQuery extends Query<Wishlist[]> {
  public readonly currentUser: ICurrentUser
  public readonly wishlistIds: WishlistId[]

  constructor(props: { currentUser: ICurrentUser; wishlistIds: WishlistId[] }) {
    super()
    this.currentUser = props.currentUser
    this.wishlistIds = props.wishlistIds
  }
}

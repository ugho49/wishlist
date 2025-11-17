import { Wishlist } from '../wishlist.model'

export class UserAddedAsCoOwnerToWishlistEvent {
  public readonly wishlist: Wishlist

  constructor(props: { wishlist: Wishlist }) {
    this.wishlist = props.wishlist
  }
}

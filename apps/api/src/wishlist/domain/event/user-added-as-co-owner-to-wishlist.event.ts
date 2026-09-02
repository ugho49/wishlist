import type { User } from '../../../user/domain/model/user.model';

import { Wishlist } from '../wishlist.model';

export class UserAddedAsCoOwnerToWishlistEvent {
  public readonly wishlist: Wishlist;
  public readonly coOwner: User;

  constructor(props: { wishlist: Wishlist; coOwner: User }) {
    this.wishlist = props.wishlist;
    this.coOwner = props.coOwner;
  }
}

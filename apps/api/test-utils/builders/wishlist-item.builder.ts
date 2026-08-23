import type { ItemId, WishlistId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { type ItemTaker, WishlistItem } from '../../src/item/domain/wishlist-item.model';
import { User } from '../../src/user/domain/model/user.model';

type WishlistItemBuilderData = {
  wishlistId: WishlistId;
  name: string;
  isSuggested: boolean;
  takers: ItemTaker[];
};

export class WishlistItemBuilder {
  private readonly data: WishlistItemBuilderData = {
    wishlistId: uuid() as WishlistId,
    name: 'Un livre',
    isSuggested: false,
    takers: [],
  };

  withWishlistId(wishlistId: WishlistId): this {
    this.data.wishlistId = wishlistId;
    return this;
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  asSuggested(): this {
    this.data.isSuggested = true;
    return this;
  }

  takenBy(user: User): this {
    this.data.takers = [...this.data.takers, { user, takenAt: new Date() }];
    return this;
  }

  build(): WishlistItem {
    return WishlistItem.create({
      id: uuid() as ItemId,
      name: this.data.name,
      wishlistId: this.data.wishlistId,
      isSuggested: this.data.isSuggested,
      takers: this.data.takers,
    });
  }
}

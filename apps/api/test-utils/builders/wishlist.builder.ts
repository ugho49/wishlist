import type { EventId, WishlistId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { User } from '../../src/user/domain/model/user.model';
import { Wishlist } from '../../src/wishlist/domain/wishlist.model';
import { UserBuilder } from './user.builder';

type WishlistBuilderData = {
  title: string;
  owner: User;
  coOwner?: User;
  hideItems: boolean;
  eventIds: EventId[];
};

export class WishlistBuilder {
  private readonly data: WishlistBuilderData = {
    title: 'Ma liste',
    owner: new UserBuilder().build(),
    hideItems: true,
    eventIds: [],
  };

  withOwner(owner: User): this {
    this.data.owner = owner;
    return this;
  }

  withCoOwner(coOwner: User): this {
    this.data.coOwner = coOwner;
    return this;
  }

  withTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  withHideItems(hideItems: boolean): this {
    this.data.hideItems = hideItems;
    return this;
  }

  withEventIds(eventIds: EventId[]): this {
    this.data.eventIds = eventIds;
    return this;
  }

  build(): Wishlist {
    const wishlist = Wishlist.create({
      id: uuid() as WishlistId,
      title: this.data.title,
      eventIds: this.data.eventIds,
      owner: this.data.owner,
      hideItems: this.data.hideItems,
    });

    return this.data.coOwner ? wishlist.addCoOwner(this.data.coOwner) : wishlist;
  }
}

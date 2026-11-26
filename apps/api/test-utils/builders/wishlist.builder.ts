import type { EventId, WishlistId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { User } from '../../src/user/domain/model/user.model';
import { Wishlist } from '../../src/wishlist/domain/wishlist.model';
import { WishlistMode } from '../../src/wishlist/domain/wishlist-mode.enum';
import { UserBuilder } from './user.builder';

type WishlistBuilderData = {
  title: string;
  owner: User;
  coOwner?: User;
  mode: WishlistMode;
  eventIds: EventId[];
};

export class WishlistBuilder {
  private readonly data: WishlistBuilderData = {
    title: 'Ma liste',
    owner: new UserBuilder().build(),
    mode: WishlistMode.SURPRISE,
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

  withMode(mode: WishlistMode): this {
    this.data.mode = mode;
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
      ownerId: this.data.owner.id,
      mode: this.data.mode,
    });

    return this.data.coOwner ? wishlist.addCoOwner(this.data.coOwner) : wishlist;
  }
}

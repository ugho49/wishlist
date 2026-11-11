import type { ICurrentUser } from '@wishlist/common';

import { Loader, Parent, ResolveField, Resolver } from '@znight/graphql';
import { NotFoundException } from '@znight/http';

import { CurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { EventsById } from '../../../event/infrastructure/event.dataloader';
import {
  type Event as GqlEvent,
  type Item as GqlItem,
  type User as GqlUser,
  type Wishlist as GqlWishlist,
} from '../../../gql/generated-types';
import { WishlistItem } from '../../../item/domain/wishlist-item.model';
import { ItemsByWishlistId } from '../../../item/infrastructure/item.dataloader';
import { itemMapper } from '../../../item/infrastructure/item.mapper';
import { UsersById } from '../../../user/infrastructure/user.dataloader';

@Resolver('Wishlist')
export class WishlistFieldResolver {
  @ResolveField()
  async owner(@Parent() wishlist: GqlWishlist, @Loader() usersLoader: Loader<UsersById>): Promise<GqlUser> {
    const owner = await usersLoader.load(wishlist.ownerId);
    if (!owner) {
      throw new NotFoundException(`Owner with id ${wishlist.ownerId} of wishlist ${wishlist.id} not found`);
    }
    return owner;
  }

  @ResolveField()
  async coOwner(
    @Parent() wishlist: GqlWishlist,
    @Loader() usersLoader: Loader<UsersById>,
  ): Promise<GqlUser | undefined> {
    if (!wishlist.coOwnerId) return Promise.resolve(undefined);
    const coOwner = await usersLoader.load(wishlist.coOwnerId);
    if (!coOwner) {
      throw new NotFoundException(`Co-owner with id ${wishlist.coOwnerId} of wishlist ${wishlist.id} not found`);
    }
    return coOwner;
  }

  @ResolveField()
  async events(@Parent() wishlist: GqlWishlist, @Loader() eventsLoader: Loader<EventsById>): Promise<GqlEvent[]> {
    if (wishlist.eventIds.length === 0) return [];
    const events = await eventsLoader.loadMany(wishlist.eventIds);
    // Filter out null values (events user doesn't have access to)
    return events.filter((event): event is GqlEvent => event !== null);
  }

  @ResolveField()
  async items(
    @Parent() wishlist: GqlWishlist,
    @CurrentUser() currentUser: ICurrentUser,
    @Loader() itemsLoader: Loader<ItemsByWishlistId>,
  ): Promise<GqlItem[]> {
    const items = await itemsLoader.load(wishlist.id);
    const isOwner = currentUser.id === wishlist.ownerId;
    const isCoOwner = currentUser.id === wishlist.coOwnerId;
    const hideItems = wishlist.config.hideItems;

    const displayUserAndSuggested = WishlistItem.canDisplaySensitiveInformations({
      wishlist: { hideItems, isOwner, isCoOwner },
    });

    return items
      .filter(item => WishlistItem.canShowItem({ item, wishlist: { hideItems, isOwner, isCoOwner } }))
      .map(item => itemMapper.toGqlItem({ item, displayUserAndSuggested }));
  }
}

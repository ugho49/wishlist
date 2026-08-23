import type { UserId } from '@wishlist/common';
import type { Wishlist } from '../domain/wishlist.model';

import { type Wishlist as GqlWishlist } from '../../gql/generated-types';
import { itemMapper } from '../../item/infrastructure/item.mapper';

function toGqlWishlist(params: { wishlist: Wishlist; currentUserId: UserId }): GqlWishlist {
  const { wishlist, currentUserId } = params;

  const displayUserAndSuggested = wishlist.canDisplayItemSensitiveInformations(currentUserId);

  return {
    __typename: 'Wishlist',
    id: wishlist.id,
    title: wishlist.title,
    description: wishlist.description,
    logoUrl: wishlist.logoUrl,
    ownerId: wishlist.owner.id,
    coOwnerId: wishlist.coOwner?.id,
    eventIds: wishlist.eventIds,
    items: wishlist
      .getItemsToDisplay(currentUserId)
      .map(item => itemMapper.toGqlItem({ item, displayUserAndSuggested })),
    config: { __typename: 'WishlistConfig', hideItems: wishlist.hideItems },
    createdAt: wishlist.createdAt.toISOString(),
    updatedAt: wishlist.updatedAt.toISOString(),
  };
}

export const wishlistMapper = {
  toGqlWishlist,
};

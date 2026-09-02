import type { Wishlist } from '../domain/wishlist.model';

import { type Wishlist as GqlWishlist } from '../../gql/generated-types';

function toGqlWishlist(params: { wishlist: Wishlist }): GqlWishlist {
  const { wishlist } = params;

  return {
    __typename: 'Wishlist',
    id: wishlist.id,
    title: wishlist.title,
    description: wishlist.description,
    logoUrl: wishlist.logoUrl,
    ownerId: wishlist.ownerId,
    coOwnerId: wishlist.coOwnerId,
    eventIds: wishlist.eventIds,
    config: { __typename: 'WishlistConfig', hideItems: wishlist.hideItems },
    createdAt: wishlist.createdAt.toISOString(),
    updatedAt: wishlist.updatedAt.toISOString(),
  };
}

export const wishlistMapper = {
  toGqlWishlist,
};

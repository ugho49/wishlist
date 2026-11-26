import type { Wishlist } from '../domain/wishlist.model';

import { match } from 'ts-pattern';

import { type Wishlist as GqlWishlist, WishlistMode as GqlWishlistMode } from '../../gql/generated-types';
import { WishlistMode } from '../domain/wishlist-mode.enum';

function toGqlWishlistMode(mode: WishlistMode): GqlWishlistMode {
  return match(mode)
    .with(WishlistMode.SURPRISE, () => GqlWishlistMode.Surprise)
    .with(WishlistMode.SHARED, () => GqlWishlistMode.Shared)
    .exhaustive();
}

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
    mode: toGqlWishlistMode(wishlist.mode),
    createdAt: wishlist.createdAt.toISOString(),
    updatedAt: wishlist.updatedAt.toISOString(),
  };
}

export const wishlistMapper = {
  toGqlWishlist,
};

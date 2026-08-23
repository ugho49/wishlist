import type { WishlistItem } from '../domain/wishlist-item.model';

import { type Item as GqlItem, type ItemTaker as GqlItemTaker } from '../../gql/generated-types';

function toGqlTakers(item: WishlistItem): GqlItemTaker[] {
  return item.takers.map(taker => ({
    __typename: 'ItemTaker',
    userId: taker.user.id,
    takenAt: taker.takenAt.toISOString(),
  }));
}

function toGqlItem(param: { item: WishlistItem; displayUserAndSuggested: boolean }): GqlItem {
  const { displayUserAndSuggested, item } = param;

  const dto: GqlItem = {
    __typename: 'Item',
    id: item.id,
    name: item.name,
    description: item.description,
    score: item.score,
    url: item.url,
    pictureUrl: item.imageUrl,
    createdAt: item.createdAt.toISOString(),
    takers: [],
  };

  if (displayUserAndSuggested) {
    dto.isSuggested = item.isSuggested;
    dto.takers = toGqlTakers(item);
  }

  return dto;
}

export const itemMapper = {
  toGqlItem,
  toGqlTakers,
};

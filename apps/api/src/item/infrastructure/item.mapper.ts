import type { ItemTaker, WishlistItem } from '../domain/wishlist-item.model';

import {
  type Item as GqlItem,
  type ItemTaker as GqlItemTaker,
  type ReservedItem as GqlReservedItem,
} from '../../gql/generated-types';
import { type ReservedItem } from '../domain/wishlist-item.repository';

function toGqlItemTaker(taker: ItemTaker): GqlItemTaker {
  return {
    __typename: 'ItemTaker',
    userId: taker.userId,
    takenAt: taker.takenAt.toISOString(),
  };
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
    dto.takers = item.takers.map(taker => toGqlItemTaker(taker));
  }

  return dto;
}

function toGqlReservedItem(item: ReservedItem): GqlReservedItem {
  return {
    __typename: 'ReservedItem',
    id: item.id,
    name: item.name,
    description: item.description,
    url: item.url,
    score: item.score,
    pictureUrl: item.pictureUrl,
    takenAt: item.takenAt.toISOString(),
    wishlistId: item.wishlistId,
    wishlistTitle: item.wishlistTitle,
    ownerFirstName: item.ownerFirstName,
    ownerLastName: item.ownerLastName,
    events: item.events.map(event => ({
      __typename: 'ReservedItemEvent' as const,
      id: event.id,
      title: event.title,
      eventDate: event.eventDate,
    })),
    takers: item.takers.map(taker => ({
      __typename: 'ReservedItemTaker' as const,
      userId: taker.userId,
      firstName: taker.firstName,
      lastName: taker.lastName,
      pictureUrl: taker.pictureUrl,
      takenAt: taker.takenAt.toISOString(),
    })),
  };
}

export const itemMapper = {
  toGqlItem,
  toGqlItemTaker,
  toGqlReservedItem,
};

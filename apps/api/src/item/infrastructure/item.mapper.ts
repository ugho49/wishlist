import type { ItemTaker, WishlistItem } from '../domain/wishlist-item.model';
import type { TakenGiftRecord } from '../domain/wishlist-item.repository';

import { DateTime } from 'luxon';

import {
  type Item as GqlItem,
  type ItemTaker as GqlItemTaker,
  type TakenGift as GqlTakenGift,
} from '../../gql/generated-types';

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
    price: item.price,
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

function toGqlTakenGift(record: TakenGiftRecord): GqlTakenGift {
  return {
    __typename: 'TakenGift',
    item: toGqlItem({ item: record.item, displayUserAndSuggested: false }),
    takenAt: record.takenAt.toISOString(),
    wishlistId: record.wishlistId,
    wishlistTitle: record.wishlistTitle,
    recipient: {
      __typename: 'TakenGiftRecipient',
      id: record.recipient.id,
      firstName: record.recipient.firstName,
      lastName: record.recipient.lastName,
      pictureUrl: record.recipient.pictureUrl,
    },
    events: record.events.map(event => ({
      __typename: 'TakenGiftEvent',
      id: event.id,
      title: event.title,
      icon: event.icon,
      eventDate: DateTime.fromJSDate(event.eventDate).toISODate() || '',
    })),
  };
}

export const itemMapper = {
  toGqlItem,
  toGqlItemTaker,
  toGqlTakenGift,
};

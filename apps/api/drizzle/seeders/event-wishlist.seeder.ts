import type { EventAttendeeSeed, EventWishlistSeed, SeedDb, WishlistSeed } from './types';

import { faker } from '@faker-js/faker';

import * as schema from '../schema';
import { seedConfig } from './config';
import { chance, groupByKey, pickOne } from './helpers';

export async function seedEventWishlists(
  db: SeedDb,
  deps: { wishlists: readonly WishlistSeed[]; attendees: readonly EventAttendeeSeed[] },
): Promise<EventWishlistSeed[]> {
  const attendeesByUserId = groupByKey(deps.attendees, attendee => attendee.userId);
  const links: EventWishlistSeed[] = [];

  for (const wishlist of deps.wishlists) {
    const ownerEventIds = (attendeesByUserId.get(wishlist.ownerId) ?? []).map(attendee => attendee.eventId);
    if (ownerEventIds.length === 0) continue;

    const belongsToMultipleEvents = chance(seedConfig.wishlists.multipleEventsProbability) && ownerEventIds.length > 1;

    const eventIds = belongsToMultipleEvents
      ? faker.helpers.arrayElements(ownerEventIds, { min: 1, max: ownerEventIds.length - 1 })
      : [pickOne(ownerEventIds)];

    for (const eventId of eventIds) {
      links.push({ eventId, wishlistId: wishlist.id });
    }
  }

  if (links.length === 0) return links;

  await db.insert(schema.eventWishlist).values(links);
  return links;
}

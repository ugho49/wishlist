import type { EventAttendeeSeed, EventWishlistSeed, SeedDb, WishlistSeed } from './types';

import { faker } from '@faker-js/faker';
import { MAX_EVENTS_BY_LIST } from '@wishlist/common';

import * as schema from '../schema';
import { seedConfig } from './config';
import { chance, groupByKey, pickOne } from './helpers';

export async function seedEventWishlists(
  db: SeedDb,
  deps: { wishlists: readonly WishlistSeed[]; attendees: readonly EventAttendeeSeed[] },
): Promise<EventWishlistSeed[]> {
  const attendeesByUserId = groupByKey(deps.attendees, attendee => attendee.userId);
  const wishlistsByOwnerId = groupByKey(deps.wishlists, wishlist => wishlist.ownerId);
  const links: EventWishlistSeed[] = [];

  for (const [ownerId, ownerWishlists] of wishlistsByOwnerId) {
    const ownerEventIds = faker.helpers.shuffle([
      ...new Set((attendeesByUserId.get(ownerId) ?? []).map(attendee => attendee.eventId)),
    ]);
    if (ownerEventIds.length === 0) continue;

    const wishlistsToLink = ownerWishlists.slice(0, ownerEventIds.length);
    const leftoverEventIds = ownerEventIds.slice(wishlistsToLink.length);
    const eventsPerWishlist = new Map<string, number>();

    for (const [index, wishlist] of wishlistsToLink.entries()) {
      const eventId = ownerEventIds[index];
      if (!eventId) continue;

      links.push({ eventId, wishlistId: wishlist.id });
      eventsPerWishlist.set(wishlist.id, 1);
    }

    for (const eventId of leftoverEventIds) {
      if (!chance(seedConfig.wishlists.multipleEventsProbability)) continue;

      const eligible = wishlistsToLink.filter(
        candidate => (eventsPerWishlist.get(candidate.id) ?? 0) < MAX_EVENTS_BY_LIST,
      );
      if (eligible.length === 0) continue;

      const wishlist = pickOne(eligible);
      links.push({ eventId, wishlistId: wishlist.id });
      eventsPerWishlist.set(wishlist.id, (eventsPerWishlist.get(wishlist.id) ?? 0) + 1);
    }
  }

  if (links.length === 0) return links;

  await db.insert(schema.eventWishlist).values(links);
  return links;
}

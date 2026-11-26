import type { EventAttendeeSeed, SeedDb, UserSeed, WishlistSeed } from './types';

import { faker } from '@faker-js/faker';

import { WishlistMode } from '../../src/wishlist/domain/wishlist-mode.enum';
import * as schema from '../schema';
import { seedConfig } from './config';
import { chance, groupByKey, insertInBatches, intBetween, maybe, uuid } from './helpers';

export async function seedWishlists(
  db: SeedDb,
  deps: { users: readonly UserSeed[]; attendees: readonly EventAttendeeSeed[] },
): Promise<WishlistSeed[]> {
  const attendeesByUserId = groupByKey(deps.attendees, attendee => attendee.userId);
  const wishlists: WishlistSeed[] = [];

  for (const user of deps.users) {
    const userAttendees = attendeesByUserId.get(user.id);
    const userEventIds = [...new Set((userAttendees ?? []).map(attendee => attendee.eventId))];
    if (userEventIds.length === 0) continue;
    if (!chance(seedConfig.wishlists.ownerHasWishlistProbability)) continue;

    const count = intBetween({
      min: seedConfig.wishlists.perOwner.min,
      max: Math.min(seedConfig.wishlists.perOwner.max, userEventIds.length),
    });

    for (let i = 0; i < count; i++) {
      wishlists.push({
        id: uuid(),
        title: `Liste de ${user.firstName} ${user.lastName}`,
        ownerId: user.id,
        description: maybe(seedConfig.wishlists.descriptionProbability, () => faker.lorem.paragraph()),
        mode: chance(seedConfig.wishlists.surpriseModeProbability) ? WishlistMode.SURPRISE : WishlistMode.SHARED,
      });
    }
  }

  if (wishlists.length === 0) return wishlists;

  await insertInBatches(db, schema.wishlist, wishlists);
  return wishlists;
}

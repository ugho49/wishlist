import type { EventAttendeeSeed, SeedDb, UserSeed, WishlistSeed } from './types';

import { faker } from '@faker-js/faker';

import * as schema from '../schema';
import { seedConfig } from './config';
import { chance, groupByKey, intBetween, maybe, uuid } from './helpers';

export async function seedWishlists(
  db: SeedDb,
  deps: { users: readonly UserSeed[]; attendees: readonly EventAttendeeSeed[] },
): Promise<WishlistSeed[]> {
  const attendeesByUserId = groupByKey(deps.attendees, attendee => attendee.userId);
  const wishlists: WishlistSeed[] = [];

  for (const user of deps.users) {
    const userAttendees = attendeesByUserId.get(user.id);
    if (!userAttendees || userAttendees.length === 0) continue;
    if (!chance(seedConfig.wishlists.ownerHasWishlistProbability)) continue;

    const count = intBetween(seedConfig.wishlists.perOwner);

    for (let i = 0; i < count; i++) {
      wishlists.push({
        id: uuid(),
        title: `Liste de ${user.firstName} ${user.lastName}`,
        ownerId: user.id,
        description: maybe(seedConfig.wishlists.descriptionProbability, () => faker.lorem.paragraph()),
        hideItems: chance(seedConfig.wishlists.hideItemsProbability),
      });
    }
  }

  if (wishlists.length === 0) return wishlists;

  await db.insert(schema.wishlist).values(wishlists);
  return wishlists;
}

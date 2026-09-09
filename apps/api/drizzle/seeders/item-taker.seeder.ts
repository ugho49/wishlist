import type { ItemSeed, ItemTakerSeed, SeedDb, UserSeed, WishlistSeed } from './types';

import { faker } from '@faker-js/faker';

import * as schema from '../schema';
import { seedConfig } from './config';
import { chance, intBetween } from './helpers';

export async function seedItemTakers(
  db: SeedDb,
  deps: { items: readonly ItemSeed[]; wishlists: readonly WishlistSeed[]; users: readonly UserSeed[] },
): Promise<ItemTakerSeed[]> {
  const wishlistById = new Map(deps.wishlists.map(wishlist => [wishlist.id, wishlist]));
  const takers: ItemTakerSeed[] = [];

  for (const item of deps.items) {
    const wishlist = wishlistById.get(item.wishlistId);
    if (!wishlist) continue;
    if (!chance(seedConfig.itemTakers.takenProbability)) continue;

    const eligibleUsers = deps.users.filter(user => user.id !== wishlist.ownerId);
    if (eligibleUsers.length === 0) continue;

    const count = intBetween({
      min: seedConfig.itemTakers.perItem.min,
      max: Math.min(seedConfig.itemTakers.perItem.max, eligibleUsers.length),
    });

    for (const taker of faker.helpers.arrayElements(eligibleUsers, count)) {
      takers.push({
        itemId: item.id,
        userId: taker.id,
        takenAt: faker.date.recent({ days: 30 }),
      });
    }
  }

  if (takers.length === 0) return takers;

  await db.insert(schema.itemTaker).values(takers);
  return takers;
}

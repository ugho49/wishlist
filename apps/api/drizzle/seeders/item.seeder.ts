import type { ItemSeed, SeedDb, WishlistSeed } from './types';

import { faker } from '@faker-js/faker';

import * as schema from '../schema';
import { seedConfig } from './config';
import { chance, intBetween, maybe, uuid } from './helpers';

export async function seedItems(db: SeedDb, deps: { wishlists: readonly WishlistSeed[] }): Promise<ItemSeed[]> {
  const items: ItemSeed[] = [];

  for (const wishlist of deps.wishlists) {
    const count = intBetween(seedConfig.items.perWishlist);

    for (let i = 0; i < count; i++) {
      items.push({
        id: uuid(),
        name: faker.commerce.productName(),
        wishlistId: wishlist.id,
        pictureUrl: faker.image.url({
          width: intBetween({ min: 300, max: 700 }),
          height: intBetween({ min: 300, max: 700 }),
        }),
        description: maybe(seedConfig.items.descriptionProbability, () => faker.commerce.productDescription()),
        score: maybe(seedConfig.items.scoreProbability, () => faker.number.int({ min: 1, max: 5 })),
        isSuggested: chance(seedConfig.items.suggestedProbability),
      });
    }
  }

  if (items.length === 0) return items;

  await db.insert(schema.item).values(items);
  return items;
}

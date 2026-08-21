import type { DrizzleDatabase } from '@wishlist/api/core'
import type { EventId, WishlistId } from '@wishlist/common'
import type { InferInsertModel } from 'drizzle-orm'

import { faker } from '@faker-js/faker'
import { schema } from '@wishlist/api-drizzle'
import { uuid } from '@wishlist/common'

import { insertRow, type LooseInsert } from './insert-row'

type WishlistInsert = InferInsertModel<typeof schema.wishlist>

export type CreateWishlistOverrides = LooseInsert<WishlistInsert> & {
  ownerId: string
  eventIds?: string[]
}

export function createWishlistFactory(db: DrizzleDatabase) {
  return {
    async create(overrides: CreateWishlistOverrides) {
      const { eventIds, ...rest } = overrides

      const wishlist = await insertRow(db, schema.wishlist, {
        id: uuid() as WishlistId,
        title: faker.lorem.words({ min: 2, max: 4 }),
        hideItems: true,
        ...rest,
      } as WishlistInsert)

      if (eventIds && eventIds.length > 0) {
        await db.insert(schema.eventWishlist).values(
          eventIds.map(eventId => ({
            eventId: eventId as EventId,
            wishlistId: wishlist.id,
          })),
        )
      }

      return wishlist
    },
  }
}

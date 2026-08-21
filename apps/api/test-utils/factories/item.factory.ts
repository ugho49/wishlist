import type { DrizzleDatabase } from '@wishlist/api/core'
import type { ItemId } from '@wishlist/common'
import type { InferInsertModel } from 'drizzle-orm'

import { faker } from '@faker-js/faker'
import { schema } from '@wishlist/api-drizzle'
import { uuid } from '@wishlist/common'

import { insertRow, type LooseInsert } from './insert-row'

type ItemInsert = InferInsertModel<typeof schema.item>

export type CreateItemOverrides = LooseInsert<ItemInsert> & {
  wishlistId: string
}

export function createItemFactory(db: DrizzleDatabase) {
  return {
    create(overrides: CreateItemOverrides) {
      return insertRow(db, schema.item, {
        id: uuid() as ItemId,
        name: faker.commerce.productName(),
        isSuggested: false,
        ...overrides,
      } as ItemInsert)
    },
  }
}

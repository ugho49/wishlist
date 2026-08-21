import type { DrizzleDatabase } from '@wishlist/api/core'
import type { SecretSantaUserId } from '@wishlist/common'
import type { InferInsertModel } from 'drizzle-orm'

import { schema } from '@wishlist/api-drizzle'
import { uuid } from '@wishlist/common'

import { insertRow, type LooseInsert } from './insert-row'

type SecretSantaUserInsert = InferInsertModel<typeof schema.secretSantaUser>

export type CreateSecretSantaUserOverrides = LooseInsert<SecretSantaUserInsert> & {
  secretSantaId: string
  attendeeId: string
}

export function createSecretSantaUserFactory(db: DrizzleDatabase) {
  return {
    create(overrides: CreateSecretSantaUserOverrides) {
      return insertRow(db, schema.secretSantaUser, {
        id: uuid() as SecretSantaUserId,
        exclusions: [],
        ...overrides,
      } as SecretSantaUserInsert)
    },
  }
}

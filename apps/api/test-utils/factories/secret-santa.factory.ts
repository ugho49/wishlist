import type { DrizzleDatabase } from '@wishlist/api/core'
import type { SecretSantaId } from '@wishlist/common'
import type { InferInsertModel } from 'drizzle-orm'

import { schema } from '@wishlist/api-drizzle'
import { SecretSantaStatus, uuid } from '@wishlist/common'

import { insertRow, type LooseInsert } from './insert-row'

type SecretSantaInsert = InferInsertModel<typeof schema.secretSanta>

export type CreateSecretSantaOverrides = LooseInsert<SecretSantaInsert> & {
  eventId: string
}

export function createSecretSantaFactory(db: DrizzleDatabase) {
  return {
    create(overrides: CreateSecretSantaOverrides) {
      return insertRow(db, schema.secretSanta, {
        id: uuid() as SecretSantaId,
        status: SecretSantaStatus.CREATED,
        ...overrides,
      } as SecretSantaInsert)
    },
  }
}

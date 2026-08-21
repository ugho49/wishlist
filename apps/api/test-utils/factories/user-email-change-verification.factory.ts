import type { DrizzleDatabase } from '@wishlist/api/core'
import type { UserEmailChangeVerificationId } from '@wishlist/common'
import type { InferInsertModel } from 'drizzle-orm'

import { faker } from '@faker-js/faker'
import { schema } from '@wishlist/api-drizzle'
import { uuid } from '@wishlist/common'

import { insertRow, type LooseInsert } from './insert-row'

type UserEmailChangeVerificationInsert = InferInsertModel<typeof schema.userEmailChangeVerification>

export type CreateUserEmailChangeVerificationOverrides = LooseInsert<UserEmailChangeVerificationInsert> & {
  userId: string
  expiredAt: Date
}

export function createUserEmailChangeVerificationFactory(db: DrizzleDatabase) {
  return {
    create(overrides: CreateUserEmailChangeVerificationOverrides) {
      return insertRow(db, schema.userEmailChangeVerification, {
        id: uuid() as UserEmailChangeVerificationId,
        newEmail: faker.internet.email().toLowerCase(),
        token: faker.string.alphanumeric(32),
        ...overrides,
      } as UserEmailChangeVerificationInsert)
    },
  }
}

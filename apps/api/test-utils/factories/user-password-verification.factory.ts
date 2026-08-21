import type { DrizzleDatabase } from '@wishlist/api/core'
import type { UserPasswordVerificationId } from '@wishlist/common'
import type { InferInsertModel } from 'drizzle-orm'

import { faker } from '@faker-js/faker'
import { schema } from '@wishlist/api-drizzle'
import { uuid } from '@wishlist/common'

import { insertRow, type LooseInsert } from './insert-row'

type UserPasswordVerificationInsert = InferInsertModel<typeof schema.userPasswordVerification>

export type CreateUserPasswordVerificationOverrides = LooseInsert<UserPasswordVerificationInsert> & {
  userId: string
  expiredAt: Date
}

export function createUserPasswordVerificationFactory(db: DrizzleDatabase) {
  return {
    create(overrides: CreateUserPasswordVerificationOverrides) {
      return insertRow(db, schema.userPasswordVerification, {
        id: uuid() as UserPasswordVerificationId,
        token: faker.string.alphanumeric(32),
        ...overrides,
      } as UserPasswordVerificationInsert)
    },
  }
}
